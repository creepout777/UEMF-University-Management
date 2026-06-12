import { Router, type IRouter } from "express";
import healthRouter from "./health";
import dashboardRouter from "./dashboard";
import studentsRouter from "./students";
import coursesRouter from "./courses";
import facultyRouter from "./faculty";
import departmentsRouter from "./departments";
import enrollmentsRouter from "./enrollments";
import gradesRouter from "./grades";
import schedulesRouter from "./schedules";
import examsRouter from "./exams";
import feesRouter from "./fees";
import announcementsRouter from "./announcements";

const router: IRouter = Router();

router.use(healthRouter);
router.use(dashboardRouter);
router.use(studentsRouter);
router.use(coursesRouter);
router.use(facultyRouter);
router.use(departmentsRouter);
router.use(enrollmentsRouter);
router.use(gradesRouter);
router.use(schedulesRouter);
router.use(examsRouter);
router.use(feesRouter);
router.use(announcementsRouter);

export default router;
