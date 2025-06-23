import { Router } from 'express';
import { authMiddleware } from '../middleware/authMiddleware.ts';
import { CalendarController } from '../controller/calendarController.ts';
import { CalendarService } from '../service/calendarService.ts';

const calendarRouter = Router();

const calendarService = new CalendarService();
const calendarController = new CalendarController(calendarService);

calendarRouter.get('/', authMiddleware, calendarController.getCalendar);
calendarRouter.get('/next', authMiddleware, calendarController.getCalendarNext);
calendarRouter.post('/reminder', authMiddleware, calendarController.createReminder);

export default calendarRouter;