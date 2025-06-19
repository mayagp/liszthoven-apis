export class UpdateUserAdminDto {
  name: string;
  email: string;
  password: string;
  username: string;
  staff: {
    identification_number: string;
    tax_number: string;
    bpjs_number: string;
    working_since: Date;
    note: string;
    role: number;
    user_id: number;
    branch_id: number;
  };
  supplier: {
    tax_no: string;
    total_payable: number;
    account_no: string;
    bank: string;
    swift_code: string;
  };
}
