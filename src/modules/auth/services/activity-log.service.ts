import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ActivityLog } from '../schemas/activity-log.schema';
// import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ActivityLogService {
    constructor(
        // private prisma: PrismaService
        @InjectModel(ActivityLog.name) private activityLogModel: Model<ActivityLog>,


    ) { }

    async create(data: {
        userId: string;
        action: string;
        details?: any;
        ipAddress?: string;
        userAgent?: string;
    }) {
        const newActivityLog = new this.activityLogModel({
            ...data,
            details: data.details ? JSON.stringify(data.details) : null,
            createdAt: new Date(),
        });
        return newActivityLog.save();
    }

    async findByUser(userId: string) {
        return this.activityLogModel.find({ _id: userId }).sort({ createdAt: -1 }).exec();
    }
}