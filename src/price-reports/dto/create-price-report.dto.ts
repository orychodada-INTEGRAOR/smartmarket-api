export class CreatePriceReportDto {
  productId: number;
  storeId: number;
  userId: number;
  reportedPrice: string;
  imageUrl?: string;
  isWeighted?: boolean;
  freshnessScore?: number;
  cleanlinessScore?: number;
}