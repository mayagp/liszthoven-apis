export class UpdateUserDto {
  name: string;
  email: string;
  gender: number;
  password: string;
  username: string;
  birth_date: Date;
  birth_place: string;
  staff: {
    identification_number: string;
    tax_number: string;
    bpjs_number: string;
    working_since: Date;
    religion: number;
    note: string;
    role: number;
    user_id: number;
    branch_id: number;
  };
}
