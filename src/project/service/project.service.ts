import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../lib/prisma';
import { Prisma, Project } from '@prisma/client';
import { CreateProjectDto } from '../dto/create-project.dto';
import { UpdateProjectDto } from '../dto/update-project.dto';
import { ProjectListResponse } from '../dto/project-list-response.dto';

@Injectable()
export class ProjectService {
  constructor(private readonly prismaService: PrismaService) {}

  async findMany(
    limit: number,
    offset: number,
    search: string,
    userId: number,
  ): Promise<ProjectListResponse> {
    const total: number = await this.prismaService.project.count({
      where: {
        userId,
        status: {
          not: 'deleted',
        },
        OR: [
          {
            name: {
              contains: search,
            },
          },
          {
            url: {
              contains: search,
            },
          },
        ],
      },
      orderBy: {
        updatedAt: 'asc',
      },
    });

    const list: Project[] = await this.prismaService.project.findMany({
      where: {
        userId,
        status: {
          not: 'deleted',
        },
        OR: [
          {
            name: {
              contains: search,
            },
          },
          {
            url: {
              contains: search,
            },
          },
        ],
      },
      take: limit,
      skip: offset * limit,
      orderBy: {
        updatedAt: 'asc',
      },
    });

    return {
      data: list.map((x: Project) => ({
        id: x.id,
        name: x.name,
        url: x.url,
        status: x.status,
        expiredAt: x.expiredAt,
        createdAt: x.createdAt,
        updatedAt: x.updatedAt,
      })),
      total,
      size: list.length,
      offset,
      limit,
    };
  }

  async findOne(id: number) {
    const project = this.prismaService.project.findUnique({
      where: {
        id,
      },
    });
    if (!project) throw new NotFoundException('Transaction not found');
    return project;
  }

  async create(createProjectDto: CreateProjectDto, userId: number) {
    return this.prismaService.project.create({
      data: {
        ...createProjectDto,
        user: {
          connect: {
            id: userId,
          },
        },
      },
    });
  }

  async update(id: number, updateProjectDto: UpdateProjectDto) {
    return this.prismaService.project.update({
      where: {
        id,
      },
      data: {
        ...updateProjectDto,
      },
    });
  }

  async remove(id: number) {
    return this.prismaService.project.update({
      where: {
        id,
      },
      data: {
        status: 'deleted',
      },
    });
  }

  async checkExpired() {
    await this.prismaService.project.updateMany({
      data: {
        status: 'expired',
      },
      where: {
        expiredAt: {
          lt: new Date().toISOString(),
        },
        OR: [
          {
            status: {
              not: 'deleted',
            },
          },
          {
            status: {
              not: 'expired',
            },
          },
        ],
      },
    });
  }
}
