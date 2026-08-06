import { IsOptional, IsString, IsEnum } from 'class-validator';

export enum SourceType {
  URL = 'URL',
  FILE = 'FILE',
  TEXT = 'TEXT',
  API = 'API',
}

export class IngestSourceDto {
  @IsEnum(SourceType)
  type: SourceType;

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  content?: string; // raw text for TEXT type

  @IsOptional()
  @IsString()
  url?: string; // for URL or API type

  @IsOptional()
  metadata?: Record<string, any>;
}
