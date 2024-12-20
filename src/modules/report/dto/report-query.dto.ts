import { IsIn, IsOptional, IsString } from "class-validator";
import { PaginationQueryDto } from "src/common/dto/paginated-query.dto";
import { Status } from "../schemas/report.schema";

export class ReportQueryDto extends PaginationQueryDto {
    @IsOptional()
    @IsString()
    @IsIn([Status.Approved, Status.Pending, Status.Published, Status.Rejected])
    status?: string
}
