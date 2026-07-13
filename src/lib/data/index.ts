import { DynamoDbFamilyRepository } from "@/lib/data/dynamodb-repository";
import { MemoryFamilyRepository } from "@/lib/data/memory-repository";
import type { FamilyRepository } from "@/lib/data/repository";
import { serverEnv } from "@/lib/env";

let repository: FamilyRepository | null = null;

export function getFamilyRepository(): FamilyRepository {
  if (repository) {
    return repository;
  }

  if (!serverEnv.useInMemoryDb && serverEnv.tableName) {
    repository = new DynamoDbFamilyRepository(serverEnv.tableName);
    return repository;
  }

  repository = new MemoryFamilyRepository();
  return repository;
}
