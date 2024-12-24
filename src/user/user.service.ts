import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { AuthDto } from 'src/auth/dto/auth.dto';
import { hash } from 'argon2';
import { UserDto } from './dto/user.dto';
import { startOfDay, subDays } from 'date-fns';
import { TaskService } from 'src/task/task.service';
@Injectable()
export class UserService {
  constructor(private prisma: PrismaService, private taskService: TaskService) { }
  
  getById(id: string) {
    return this.prisma.user.findUnique({ where: { id }, include: { tasks: true } });
  }

  
  getByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email }, include: { tasks: true } });
  }

  async geProfile(id: string) {
    const profile = await this.getById(id);

    const totalTasks = profile.tasks.length;
    const completedTasks = await this.taskService.countTasks(id);

    const todayStart = startOfDay(new Date());
    const weekStart = startOfDay(subDays(new Date(), 7));

    const todayTasks = await this.taskService.countTasks(id, todayStart.toISOString());

    const weekStarts = await this.taskService.countTasks(id, weekStart.toISOString());

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...rest } = profile;

    return {
      user: rest,
      statistics: [
        {
          name: 'Total tasks',
          value: totalTasks,
        },
        {
          name: 'Completed tasks',
          value: completedTasks,
        },
        {
          name: 'Today tasks',
          value: todayTasks,
        },
        {
          name: 'Week tasks',
          value: weekStarts,
        }
      ]
    };
    
  }
  async create(dto: AuthDto) {
    const user = {
      email: dto.email,
      name: '',
      password: await hash(dto.password),
    }
    return this.prisma.user.create({ data: user });
  }

  async update(id: string, dto: UserDto) {
    let data = dto

    if (dto.password) {
      data = {...dto, password: await hash(dto.password)}      
    }

    return this.prisma.user.update({ where: { id }, data,select: { name: true, email: true} });
  }
}
