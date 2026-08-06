import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { IngestSourceDto } from './dto/ingest-source.dto';
import { QueryKnowledgeDto } from './dto/query-knowledge.dto';
import { QuerySourcesDto } from './dto/query-sources.dto';

@Injectable()
export class KnowledgeService {
  constructor(private readonly prisma: PrismaService) {}

  async listSources(tenantId: string, query: QuerySourcesDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: any = {
      tenant_id: tenantId,
    };

    if (query.type) {
      where.type = query.type;
    }

    if (query.status) {
      where.status = query.status;
    }

    if (query.search) {
      where.name = { contains: query.search, mode: 'insensitive' };
    }

    const [sources, total] = await Promise.all([
      this.prisma.ragSource.findMany({
        where,
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
        include: {
          documents: {
            orderBy: { created_at: 'desc' },
          },
        },
      }),
      this.prisma.ragSource.count({ where }),
    ]);

    return {
      data: sources,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async ingestSource(tenantId: string, dto: IngestSourceDto) {
    // Simplified ingest: create source + document + placeholder chunks.
    // In production, you would parse content, chunk, embed, and store embeddings.

    const source = await this.prisma.ragSource.create({
      data: {
        tenant_id: tenantId,
        type: dto.type as any,
        name: dto.name,
        url: dto.url,
        metadata: dto.metadata,
        status: 'processed',
      },
    });

    const document = await this.prisma.ragDocument.create({
      data: {
        tenant_id: tenantId,
        source_id: source.id,
        title: dto.name,
        content: dto.content ?? '',
        url: dto.url,
        status: 'processed',
      },
    });

    // Placeholder chunk (in production, generate from real chunking logic)
    const chunk = await this.prisma.ragChunk.create({
      data: {
        tenant_id: tenantId,
        document_id: document.id,
        content: dto.content ?? `Content from source: ${dto.name}`,
        position: 0,
        metadata: { source_type: dto.type },
      },
    });

    // Placeholder embedding (in production, compute via embedding model)
    const embedding = await this.prisma.ragEmbedding.create({
      data: {
        tenant_id: tenantId,
        chunk_id: chunk.id,
        vector: new Array(1536).fill(0), // placeholder vector
        model: 'placeholder',
      },
    });

    return { source, document, chunk, embedding };
  }

  async queryKnowledge(tenantId: string, dto: QueryKnowledgeDto) {
    // Simplified retrieval: text search on chunks + metadata filters.
    // In production, you would use vector similarity search on embeddings.

    const where: any = {
      tenant_id: tenantId,
    };

    if (dto.sourceId) {
      where.document = {
        source_id: dto.sourceId,
      };
    }

    if (dto.agentId) {
      where.document = {
        ...where.document,
        ingested_by_agent_id: dto.agentId,
      };
    }

    const chunks = await this.prisma.ragChunk.findMany({
      where,
      include: {
        document: {
          include: {
            source: true,
          },
        },
      },
      orderBy: { created_at: 'desc' },
      take: dto.topK ?? 5,
    });

    // Log query for analytics
    await this.prisma.ragQuery.create({
      data: {
        tenant_id: tenantId,
        query: dto.query,
        results_count: chunks.length,
        latency_ms: 0, // placeholder
      },
    });

    return {
      query: dto.query,
      results: chunks.map((chunk) => ({
        chunkId: chunk.id,
        content: chunk.content,
        documentId: chunk.document_id,
        documentTitle: chunk.document.title,
        sourceId: chunk.document.source_id,
        sourceName: chunk.document.source.name,
        metadata: chunk.metadata,
      })),
    };
  }

  async getSourcesByAgent(tenantId: string, agentId: string) {
    const sources = await this.prisma.ragSource.findMany({
      where: {
        tenant_id: tenantId,
      },
      include: {
        documents: {
          where: {
            ingested_by_agent_id: agentId,
          },
          include: {
            chunks: true,
          },
        },
      },
    });

    return sources;
  }
}
