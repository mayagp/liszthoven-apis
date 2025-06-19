import { CreatePurchaseRequestDetailDto } from 'src/features/purchase-request-detail/dto/create-purchase-request-detail.dto';
import { UpdatePurchaseRequestDto } from './update-purchase-request.dto';

export class CreatePurchaseRequestDto extends UpdatePurchaseRequestDto {
  purchase_request_details: Array<CreatePurchaseRequestDetailDto>;
}
