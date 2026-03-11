export class UpdatePriceReportDto {
  reportedPrice?: string;
  imageUrl?: string;
  freshnessScore?: number;
  cleanlinessScore?: number;
  status?: 'PENDING' | 'APPROVED' | 'REJECTED';
}