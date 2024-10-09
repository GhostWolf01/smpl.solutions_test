import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { ProjectModule } from 'src/project/module';

@Module({
  imports: [ProjectModule],
  providers: [TasksService],
})
export class TasksModule {}
