import { Injectable } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';
import { ProjectService } from 'src/project/service/project.service';

@Injectable()
export class TasksService {
  constructor(private readonly projectService: ProjectService) {}

  @Interval(3600)
  updateProjectsExpired() {
    this.projectService.checkExpired();
  }
}
