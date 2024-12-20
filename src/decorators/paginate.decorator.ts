import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const Paginate = createParamDecorator(
    (data: unknown, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest();
        return {
            page: parseInt(request.query.page, 10) || 1,
            limit: parseInt(request.query.limit, 10) || 10
        };
    }
);