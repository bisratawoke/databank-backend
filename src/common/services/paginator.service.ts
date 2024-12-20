// import { Injectable } from '@nestjs/common';
// import { PaginationOptionsDto } from '../dto/pagination.dto';

// export class PaginationResult<T> {
//     data: T[];
//     meta: {
//         page: number;
//         limit: number;
//         totalItems: number;
//         totalPages: number;
//     };
// }

// @Injectable()
// export class PaginatorService {
//     paginate<T>(
//         data: T[],
//         options: PaginationOptionsDto
//     ): PaginationResult<T> {
//         const page = options.page || 1;
//         const limit = options.limit || 10;
//         const startIndex = (page - 1) * limit;
//         const endIndex = startIndex + limit;

//         const paginatedItems = data.slice(startIndex, endIndex);

//         return {
//             data: paginatedItems,
//             meta: {
//                 page,
//                 limit,
//                 totalItems: data.length,
//                 totalPages: Math.ceil(data.length / limit)
//             }
//         };
//     }

//     async paginateQuery<T>(
//         query: any,
//         options: PaginationOptionsDto
//     ): Promise<PaginationResult<T>> {
//         const page = options.page || 1;
//         const limit = options.limit || 10;
//         const skip = (page - 1) * limit;

//         const [data, total] = await Promise.all([
//             query.skip(skip).limit(limit).exec(),
//             query.model.countDocuments(query.getFilter())
//         ]);

//         return {
//             data,
//             meta: {
//                 page,
//                 limit,
//                 totalItems: total,
//                 totalPages: Math.ceil(total / limit)
//             }
//         };
//     }
// }


import {
    Injectable,
    BadRequestException
} from '@nestjs/common';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
    IsOptional,
    IsString,
    IsInt,
    Min,
    Max,
    IsEnum
} from 'class-validator';

// Enum for sorting order
export enum SortOrder {
    ASC = 'asc',
    DESC = 'desc'
}

// Enhanced Pagination DTO
export class PaginationOptionsDto {
    @ApiPropertyOptional({
        type: Number,
        default: 1,
        description: 'Page number'
    })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page?: number = 1;

    @ApiPropertyOptional({
        type: Number,
        default: 10,
        description: 'Number of items per page'
    })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(100)
    limit?: number = 10;

    @ApiPropertyOptional({
        type: String,
        description: 'Field to sort by',
        example: 'createdAt'
    })
    @IsOptional()
    @IsString()
    sortBy?: string;

    @ApiPropertyOptional({
        enum: SortOrder,
        description: 'Sort order',
        default: SortOrder.DESC
    })
    @IsOptional()
    @IsEnum(SortOrder)
    orderBy?: SortOrder = SortOrder.DESC;

    @ApiPropertyOptional({
        type: String,
        description: 'Search query across multiple fields',
        example: 'john doe'
    })
    @IsOptional()
    @IsString()
    search?: string;
}

// Enhanced Pagination Result
export class PaginationResult<T> {
    data: T[];
    meta: {
        page: number;
        limit: number;
        totalItems: number;
        totalPages: number;
        search?: string;
        sortBy?: string;
        orderBy?: SortOrder;
    };
}

// Enhanced Paginator Service
@Injectable()
export class PaginatorService {
    /**
     *  pagination with sorting and searching
     * @param data Full list of items
     * @param options Pagination and search options
     * @returns Paginated and filtered result
     */
    paginate<T>(
        data: T[],
        options: PaginationOptionsDto,
        searchFields?: (keyof T)[]
    ): PaginationResult<T> {
        const {
            page = 1,
            limit = 10,
            sortBy,
            orderBy = SortOrder.DESC,
            search
        } = options;

        // Apply search if provided
        let filteredItems = search && searchFields
            ? this.performSearch(data, search, searchFields)
            : [...data];

        // Apply sorting if sortBy is provided
        if (sortBy) {
            filteredItems.sort((a, b) => {
                const valueA = a[sortBy as keyof T];
                const valueB = b[sortBy as keyof T];

                if (valueA == null) return orderBy === SortOrder.ASC ? 1 : -1;
                if (valueB == null) return orderBy === SortOrder.ASC ? -1 : 1;

                if (typeof valueA === 'string' && typeof valueB === 'string') {
                    return orderBy === SortOrder.ASC
                        ? valueA.localeCompare(valueB)
                        : valueB.localeCompare(valueA);
                }

                return orderBy === SortOrder.ASC
                    ? (valueA as any) - (valueB as any)
                    : (valueB as any) - (valueA as any);
            });
        }

        // Calculate pagination
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedItems = filteredItems.slice(startIndex, endIndex);

        return {
            data: paginatedItems,
            meta: {
                page,
                limit,
                totalItems: filteredItems.length,
                totalPages: Math.ceil(filteredItems.length / limit),
                search,
                sortBy,
                orderBy
            }
        };
    }

    /**
     * Advanced pagination for Mongoose queries
     * @param query Mongoose query
     * @param options Pagination and search options
     * @returns Paginated and filtered result
     */
    async paginateQuery<T>(
        query: any,
        options: PaginationOptionsDto,
        searchFields?: string[]
    ): Promise<PaginationResult<T>> {
        const {
            page = 1,
            limit = 10,
            sortBy = '_id',
            orderBy = SortOrder.DESC,
            search
        } = options;

        // Prepare base query
        let baseQuery = query;

        // Apply search if provided and search fields exist
        if (search && searchFields && searchFields.length > 0) {
            const searchFilter = this.buildSearchFilter(search, searchFields);
            baseQuery = baseQuery.find(searchFilter);
        }

        // Prepare sorting
        const sortOptions = {
            [sortBy]: orderBy === SortOrder.ASC ? 1 : -1
        };

        // Calculate pagination
        const skip = (page - 1) * limit;

        // Execute queries
        const [data, total] = await Promise.all([
            baseQuery
                .sort(sortOptions)
                .skip(skip)
                .limit(limit)
                .exec(),
            baseQuery.countDocuments()
        ]);

        return {
            data,
            meta: {
                page,
                limit,
                totalItems: total,
                totalPages: Math.ceil(total / limit),
                search,
                sortBy,
                orderBy
            }
        };
    }

    /**
     * Perform search across multiple fields
     * @param data Items to search
     * @param searchTerm Search query
     * @param searchFields Fields to search in
     * @returns Filtered items
     */
    private performSearch<T>(
        data: T[],
        searchTerm: string,
        searchFields: (keyof T)[]
    ): T[] {
        const normalizedSearch = searchTerm.toLowerCase().trim();

        return data.filter(item =>
            searchFields.some(field => {
                const value = item[field];

                // Handle null or undefined values
                if (value == null) return false;

                // Convert to string and search
                const strValue = String(value).toLowerCase();
                return strValue.includes(normalizedSearch);
            })
        );
    }

    /**
     * Build search filter for Mongoose queries
     * @param searchTerm Search query
     * @param searchFields Fields to search in
     * @returns Mongoose search filter
     */
    private buildSearchFilter(
        searchTerm: string,
        searchFields: string[]
    ): Record<string, any> {
        // Create an OR query for multiple fields
        const searchFilter = {
            $or: searchFields.map(field => ({
                [field]: {
                    $regex: searchTerm,
                    $options: 'i' // Case-insensitive
                }
            }))
        };

        return searchFilter;
    }
}