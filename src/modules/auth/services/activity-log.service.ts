import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ActivityLogService {
    constructor(private prisma: PrismaService) { }

    async create(data: {
        userId: number;
        action: string;
        details?: any;
        ipAddress?: string;
        userAgent?: string;
    }) {
        return this.prisma.activityLog.create({
            data: {
                ...data,
                details: data.details ? JSON.stringify(data.details) : null,
            },
        });
    }

    async findByUser(userId: number) {
        return this.prisma.activityLog.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            include: { user: true },
        });
    }
}