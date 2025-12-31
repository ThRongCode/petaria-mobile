import { Controller, Get, UseGuards } from '@nestjs/common';
import { EventService } from './event.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('event')
@UseGuards(JwtAuthGuard)
export class EventController {
  constructor(private readonly eventService: EventService) {}

  /**
   * GET /event/active
   * Get all currently active events
   */
  @Get('active')
  async getActiveEvents() {
    return this.eventService.getActiveEvents();
  }

  /**
   * GET /event/upcoming
   * Get upcoming events (not started yet)
   */
  @Get('upcoming')
  async getUpcomingEvents() {
    return this.eventService.getUpcomingEvents();
  }
}
