// src/stores/dto/store.dto.ts
export class CreateStoreDto {
  id: string;
  name: string;
  chainId: string;
  city?: string;
  address?: string;
}

export class UpdateStoreDto {
  name?: string;
  city?: string;
  address?: string;
}