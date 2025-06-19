export class CreateAutoNumberDto {
  table: string;
  format: Array<{ type: string; value: string }>;
}
