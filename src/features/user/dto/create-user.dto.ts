export class CreateUserDto {
  name: string;
  email: string;
  gender: number;
  password: string;
  username: string;
  birth_date: Date;
  staff: {
    identification_number: string;
    tax_number: string;
    bpjs_number: string;
    working_since: Date;
    religion: number;
    note: string;
    role: number;
    branchId: number;
  };
}
