import { Injectable } from '@nestjs/common';
import { SimilarityService } from './similarity.service';

@Injectable()
export class ClusteringService {
  constructor(private readonly similarity: SimilarityService) {}

  /**
   * Cluster products by similarity threshold
   */
  cluster(products: any[], threshold = 0.65) {
    const clusters: any[][] = [];

    for (const product of products) {
      let added = false;

      for (const cluster of clusters) {
        const score = this.similarity.computeSimilarity(
          product,
          cluster[0],
        );

        if (score >= threshold) {
          cluster.push(product);
          added = true;
          break;
        }
      }

      if (!added) {
        clusters.push([product]);
      }
    }

    return clusters;
  }
}