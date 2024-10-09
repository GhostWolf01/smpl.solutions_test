import { ProjectStatus } from '@prisma/client';

export type CreateProjectDto = {
  name: string;
  url: string;
  status: ProjectStatus;
  expiredAt?: string;
};
