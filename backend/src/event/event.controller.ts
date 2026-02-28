import { Controller, Get, UseGuards } from '@nestjs/common';
import { EventService } from './event.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('event')
@UseGuards(JwtAuthGuard)
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @Get('active')
  getActiveEvents() {
    return this.eventService.getActiveEvents();
  }

  @Get('upcoming')
  getUpcomingEvents() {
    return this.eventService.getUpcomingEvents();
  }
}
