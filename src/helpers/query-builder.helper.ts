import { Injectable } from '@nestjs/common';
import sequelize, { Op } from 'sequelize';

@Injectable()
export class QueryBuilderHelper {
  protected query: any;
  protected model;
  protected customField: Array<any> = [];
  protected join: Array<any> = [];
  public relation: Array<any> = [];
  protected groupByField: (string | any)[] = [];
  public condition;
  protected extraOptions;
  public subQuery = true;
  protected isSubQueryManually = false;
  protected runCount = true;
  protected countColumn = 'id';

  constructor(model: any, query: Record<string, any>) {
    this.query = query;
    this.model = model;
  }

  public async getResult() {
    const result: any = {};

    const filter = this.filter(this.query);
    if (Object.keys(filter).length > 0) {
      result.where = filter;
    }

    const filterDateRange = this.filterDateRange(this.query);
    if (Object.keys(filterDateRange).length > 0) {
      result.where !== undefined
        ? Object.assign(result.where, filterDateRange)
        : (result.where = filterDateRange);
    }

    const filterRange = this.filterRange(this.query);
    if (Object.keys(filterRange).length > 0) {
      result.where !== undefined
        ? Object.assign(result.where, filterRange)
        : (result.where = filterRange);
    }

    if (typeof this.condition !== 'undefined') {
      result.where !== undefined
        ? Object.assign(result.where, this.condition)
        : (result.where = this.condition);
    }

    const order = this.orderBy(this.query);
    if (Object.keys(order).length > 0) {
      result.order = order;
    }

    if (typeof this.query.q !== 'undefined') {
      const search = this.search(this.query);
      result.where = { ...result.where, ...search };
    }

    if (typeof this.extraOptions !== 'undefined') {
      if (typeof this.extraOptions.where !== 'undefined') {
        result.where = { ...result.where, ...this.extraOptions.where };

        // to avoid conflict on query
        delete this.extraOptions.where;
      }

      if (typeof this.extraOptions.include !== 'undefined') {
        this.relation = this.relation.concat(this.extraOptions.include);
        delete this.extraOptions.include;

        this.checkRelation(this.relation);
      }
    }

    /**
     * this code was created to handle the case parent-child join (eager load)
     * that cause problem when combined with limit offset
     * But the cost is the performance will be decreased
     *
     * so i decided to use normal query but avoid parent-child join
     * if you need to use parent-child join, then do mutiple query in your function,
     * then merge/map the result
     *
     * but if you cant solved it and need to use parent-child join, then you can use this code
     * but you have to remember the performance will be decreased!!!
     */
    // let data: any;
    // let count = 0;
    // if ('where' in result) {
    //   const res = await this.findWithFilter(result);
    //   data = res.data;
    //   count = res.count;
    // } else {
    //   const res = await this.findWithoutFilter(result);
    //   data = res.data;
    //   count = res.count;
    // }
    // const res = {
    //   count: count,
    //   data: data,
    // };
    const res = await this.findWithoutFilter(result);
    return res;
  }

  private async findWithFilter(filter) {
    const { offset, limit } = this.paginate(this.query);
    const result = await this.model.findAll({
      ...filter,
      include: this.relation,
      attributes: {
        include: [...this.customField],
      },
      group: [...this.groupByField],
      subQuery: false,
      ...this.extraOptions,
    });

    const count = result.length;
    let data = result.slice(offset, offset + limit);
    data = data.map((value) => value.get({ plain: true }));

    return { count, data };
  }

  private async findWithoutFilter(options) {
    this.remappingWhereCondition(options.where);
    const paginate = this.paginate(this.query);
    // set this variable to useable as global variable
    this.condition = options.where;
    const data = await this.model
      .findAll({
        ...options,
        include: this.relation,
        offset: paginate.offset,
        limit: paginate.limit,
        attributes: {
          include: [...this.customField],
        },
        group: [...this.groupByField],
        ...this.extraOptions,
        subQuery: this.subQuery,
      })
      .then((data) => {
        if (data) {
          data = data.map((value) => value.get({ plain: true }));
        }

        return data;
      });

    const attributes = this.model.getAttributes();
    for (const key in attributes) {
      if (attributes[key].primaryKey) {
        this.countColumn = key;
        break;
      }
    }

    if (typeof this.relation === 'undefined') {
      this.countColumn = `${this.model.name}.${this.countColumn}`;
    }
    let count = 0;
    if (this.runCount) {
      count = await this.model.count({
        distinct: true,
        include: this.relation,
        col: this.countColumn,
        ...options,
      });
    }
    return {
      count: count,
      data: data,
    };
  }

  public load(...relations) {
    this.relation = this.buildEagerLoad(relations);
    return this;
  }

  public paginate(query) {
    const paginateAttributes = ['limit', 'page'];
    const getPaginate = Object.fromEntries(
      Object.entries(query).filter(([key]) => {
        return paginateAttributes.includes(key);
      }),
    ) as Record<string, any>;

    const itemPerPage = +getPaginate.limit || 20; // Default 20 item per page
    const rawCurrentPage = +getPaginate.page || 1; // Default page 1

    const currentPage = itemPerPage * (rawCurrentPage - 1);
    const paginate = {
      offset: currentPage,
      limit: itemPerPage,
    };

    return paginate;
  }

  public sum(field: string, alias: string | null = null) {
    if (!alias) {
      alias = 'sum_' + field.split('.').pop();
    }
    this.customField.push([sequelize.fn('sum', sequelize.col(field)), alias]);
    return this;
  }

  public where(condition: object) {
    if (typeof this.condition === 'undefined') {
      this.condition = {};
    }
    Object.assign(this.condition, condition);
    return this;
  }

  public groupBy(field) {
    this.groupByField.push(field);
    return this;
  }

  public generateRawFilter(query) {
    const result: any = {};
    if (typeof query.with_filter != 'undefined') {
      if (this.query.with_filter == true) {
        const filter = this.filter(this.query);
        if (Object.keys(filter).length > 0) {
          result.where = filter;
        }

        const filterDateRange = this.filterDateRange(query);
        if (Object.keys(filterDateRange).length > 0) {
          result.where !== undefined
            ? Object.assign(result.where, filterDateRange)
            : (result.where = filterDateRange);
        }

        const filterRange = this.filterRange(query);
        if (Object.keys(filterRange).length > 0) {
          result.where !== undefined
            ? Object.assign(result.where, filterRange)
            : (result.where = filterRange);
        }
      }
    }

    if (typeof this.condition !== 'undefined') {
      result.where !== undefined
        ? Object.assign(result.where, this.condition)
        : (result.where = this.condition);
    }

    if (typeof query.q !== 'undefined') {
      const search = this.search(query);
      result.where = { ...result.where, ...search };
    }

    if (typeof this.extraOptions !== 'undefined') {
      if (typeof this.extraOptions.where !== 'undefined') {
        result.where = { ...result.where, ...this.extraOptions.where };

        // to avoid conflict on query
        delete this.extraOptions.where;
      }

      // check if there is include with where condition
      if (typeof this.extraOptions.include !== 'undefined') {
        this.checkRelation(this.extraOptions.include);
      }
    }

    return result.where;
  }

  private checkRelation(relations: Array<string | Record<string, any>>) {
    for (const relation of relations) {
      // check if relation is an object
      if (typeof relation === 'object') {
        // check if object contain "where" key
        if (Object.keys(relation).includes('where')) {
          this.isSubQueryManually = true;
          this.subQuery = false;
        }

        if (Object.keys(relation).includes('include')) {
          this.checkRelation(relation.include);
        }
      }
    }
  }

  public filter(query: object) {
    const unfilterable = [
      'order_by',
      'direction',
      'page',
      'limit',
      'filter_date_start',
      'filter_date_end',
      'filter_date_field',
      'filter_range_start',
      'filter_range_end',
      'filter_range_field',
      'q',
      'with_filter',
    ];
    const filter = {};

    Object.entries(query).forEach((value) => {
      if (value[0].startsWith('get_')) {
        return;
      }

      if (unfilterable.includes(value[0])) {
        return;
      }
      const key = '$' + value[0].replace(/-/g, '.') + '$';
      if (typeof query[key] === 'string') {
        try {
          const parsedValue = JSON.parse(query[key]);
          if (Array.isArray(parsedValue)) {
            filter[key] = parsedValue;
          }
        } catch (error) {
          console.log(error.message);
          filter[key] = value[1] || null;
        }
      } else {
        filter[key] = value[1] || null;
      }
    });
    return filter;
  }

  private filterDateRange(query: any) {
    const filterable = [
      // "filter_date_start",
      // "filter_date_end",
      'filter_date_field',
    ];

    const filter = {};
    for (let index = 0; index < query.filter_date_field?.length || 0; index++) {
      const validateFields = filterable.every((value) => {
        return query[value] && query[value][index];
      });

      let dateStart;
      let dateEnd;

      if (typeof query.filter_date_start !== 'undefined') {
        dateStart = new Date(query.filter_date_start[index]);
      }

      if (typeof query.filter_date_end !== 'undefined') {
        dateEnd = new Date(query.filter_date_end[index]);
      }

      if (validateFields) {
        const key =
          '$' + query.filter_date_field[index].replace(/-/g, '.') + '$';
        if (!isNaN(dateStart.getTime()) && !isNaN(dateEnd.getTime())) {
          Object.assign(filter, {
            [key]: {
              [Op.gte]: dateStart,
              [Op.lte]: dateEnd,
            },
          });
        } else if (!isNaN(dateStart.getTime())) {
          Object.assign(filter, {
            [key]: {
              [Op.gte]: dateStart,
            },
          });
        } else if (!isNaN(dateEnd.getTime())) {
          Object.assign(filter, {
            [key]: {
              [Op.lte]: dateEnd,
            },
          });
        }
      }
    }
    return filter;
  }

  private filterRange(query: any) {
    const filterable = [
      // "filter_range_start",
      // "filter_range_end",
      'filter_range_field',
    ];

    const filter = {};
    for (
      let index = 0;
      index < query.filter_range_field?.length || 0;
      index++
    ) {
      const validateFields = filterable.every((value) => {
        return query[value] && query[value][index];
      });
      let rangeStart;
      let rangeEnd;

      if (typeof query.filter_range_start !== 'undefined') {
        rangeStart = query.filter_range_start[index];
      }

      if (typeof query.filter_range_end !== 'undefined') {
        rangeEnd = query.filter_range_end[index];
      }

      if (validateFields) {
        const key =
          '$' + query.filter_range_field[index].replace(/-/g, '.') + '$';

        if (
          typeof rangeStart !== 'undefined' &&
          typeof rangeEnd !== 'undefined' &&
          !isNaN(rangeStart) &&
          !isNaN(rangeEnd)
        ) {
          Object.assign(filter, {
            [key]: {
              [Op.gte]: +rangeStart,
              [Op.lte]: +rangeEnd,
            },
          });
        } else if (typeof rangeStart !== 'undefined' && !isNaN(rangeStart)) {
          Object.assign(filter, {
            [key]: {
              [Op.gt]: +rangeStart,
            },
          });
        } else if (typeof rangeEnd !== 'undefined' && !isNaN(rangeEnd)) {
          Object.assign(filter, {
            [key]: {
              [Op.lt]: +rangeEnd,
            },
          });
        }
      }
    }

    return filter;
  }

  private search(query: object) {
    const getSearch = Object.fromEntries(
      Object.entries(query).filter(([key]) => {
        return key == 'q';
      }),
    );

    // get model attributes
    const attributes =
      this.model.searchable ||
      Object.keys(this.model.tableAttributes).map(
        (value) => this.model.tableName + '.' + value,
      );

    const result = {};

    attributes.forEach((value) => {
      result['$' + value + '$'] = { [Op.like]: '%' + getSearch.q + '%' };
    });

    // if result contain key
    if (Object.keys(result).length > 0) {
      for (const key in result) {
        // remove $ symbol from key
        const newKey = key.replace(/\$/g, '');

        const splitKey = newKey.split('.');

        if (splitKey.length > 1) {
          if (splitKey[0] !== this.model.tableName) {
            if (!this.isSubQueryManually) {
              this.subQuery = false;
            }
          }
        }
      }
    }

    return { [Op.or]: result };
  }

  public orderBy(query) {
    const orderStrict = ['order_by', 'direction'];
    const order = Object.fromEntries(
      Object.entries(query).filter(([key]) => {
        return orderStrict.includes(key);
      }),
    );

    if (Object.keys(order).length > 0) {
      const orderBy: string[][] = [];

      const directions = order.direction as string[]; // 👈 fix #1

      if (Array.isArray(order.order_by)) {
        for (const [index, data] of order.order_by.entries()) {
          const field = data as string; // 👈 fix #2
          const parts = field.split('-'); // parts: string[]
          orderBy.push([...parts, directions[index] || 'ASC']);

          if (parts.length > 1) {
            this.subQuery = false;
            this.isSubQueryManually = true;
          }
        }
      } else {
        const field = order.order_by as string;
        const parts = field.split('-');
        const direction =
          typeof order.direction === 'string' ? order.direction : 'ASC';

        orderBy.push([...parts, direction]);

        if (parts.length > 1) {
          this.subQuery = false;
          this.isSubQueryManually = true;
        }
      }

      return orderBy;
    }

    return [];
  }

  protected buildEagerLoad(relations: string[]): any[] {
    const result: any[] = [];
    relations.forEach((value) => {
      const relation = value.split('.');
      result.push(this.buildAssociation(relation));
    });
    return result;
  }

  protected buildAssociation(relation: Array<any>) {
    if (relation.length > 1) {
      const associationName = relation[0];
      relation.shift();
      const filterJoinOn = this.join.filter((value) => {
        return value.field == associationName;
      });

      let isRequired = false;
      if (typeof this.query['get_' + associationName] !== 'undefined') {
        isRequired = true;
        delete this.query['get_' + associationName];
      }

      return {
        required: isRequired,
        association: associationName,
        paranoid: false,
        include: [this.buildAssociation(relation)],
        ...filterJoinOn[0],
      };
    } else {
      let isRequired = false;
      if (typeof this.query['get_' + relation[0]] !== 'undefined') {
        isRequired = true;
        delete this.query['get_' + relation[0]];
      }

      return {
        required: isRequired,
        association: relation[0],
        paranoid: false,
      };
    }
  }

  public joinOn(association: string, on: Array<any>) {
    const data = { on: {}, field: {} };
    data.field = association;
    for (let index = 0; index < on.length; index++) {
      data.on['col' + index] = sequelize.where(
        on[index][0],
        on[index][1],
        on[index][2],
      );
    }
    this.join.push(data);
    return this;
  }

  public options(options) {
    this.extraOptions = options;
    return this;
  }

  protected remappingWhereCondition(condition) {
    for (const key in condition) {
      // remove $ symbol from key
      const newKey = key.replace(/\$/g, '');

      const splitKey = newKey.split('.');
      if (splitKey.length > 1) {
        if (splitKey[0] !== this.model.tableName) {
          this.deepRelation(condition[key], splitKey, this.relation);
          delete condition[key];
        }
      }
    }

    return condition;
  }

  protected deepRelation(
    value: any,
    condition: string[],
    relation: Array<{
      association: string;
      include?: any[];
      where?: any;
      required?: boolean;
    }>,
  ) {
    const findRelations = relation.filter(
      (value) => value.association === condition[0],
    );

    findRelations.forEach((findRelation) => {
      // > 2 because the first index is the association name and the second index is the field name
      if (condition.length > 2) {
        if (findRelation) {
          condition.shift();
          if (findRelation.include) {
            this.deepRelation(value, condition, findRelation.include);
          }
        }
      } else {
        findRelation.where = { ...findRelation.where, [condition[1]]: value };
        findRelation.required = true;
      }

      /**
       * set subquery to false
       * there is problem if subquery is true with
       * condition inside include/association
       * */
      if (!this.isSubQueryManually) {
        this.subQuery = false;
      }
    });
  }

  public setSubQuery(subQuery: boolean) {
    this.subQuery = subQuery;
    this.isSubQueryManually = true;
    return this;
  }

  public setRunCount(runCount: boolean) {
    this.runCount = runCount;
    return this;
  }
}
