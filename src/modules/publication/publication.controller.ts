import { Body, Controller, Delete, Get, Param, Post, Query, Res, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { MinioService } from 'src/minio/minio.service';
import { PublicationService } from './publication.service';
import { Multer } from 'multer'
import { Response } from 'express';

@Controller('publications')
export class PublicationController {

    constructor(
        private readonly minioService: MinioService,
        private readonly publicationService: PublicationService
    ) { }

    // Upload a file with optional directory path
    @Post('upload')
    @UseInterceptors(FileInterceptor('file'))
    async uploadFile(
        @UploadedFile() file: Multer.File,
        @Body('metadata') metadata: string, // File metadata from the request body
        @Body('directory') directory: string // Optional directory to upload file to
    ) {
        const buckets = await this.minioService.minioClient.listBuckets();
        const bucketName = buckets[0].name; // Assuming you're using the first bucket

        const fileBuffer = file.buffer;
        const parsedMetadata = JSON.parse(metadata);
        console.log(`Uploading file ${file.originalname} to bucket ${bucketName}`);

        // If directory is provided, create a nested path
        const filePath = directory ? `${directory}/${file.originalname}` : file.originalname;

        // Upload the file to the specified directory
        await this.minioService.uploadFileFromBuffer(bucketName, filePath, fileBuffer);

        return { message: 'File uploaded successfully', metadata: parsedMetadata };
    }

    // List all files in the first bucket
    @Get()
    @Get()
    async listFiles() {
        const bucketName = 'mybucket';
        try {
            const files = await this.publicationService.listFiles(bucketName);
            return files;
        } catch (error) {
            throw new Error('Could not retrieve files');
        }
    }


    // Delete a file by its file name
    @Delete(':fileName')
    async deleteFile(@Param('fileName') fileName: string) {
        const bucketName = 'mybucket'; // Replace with your bucket name logic if needed
        await this.publicationService.deleteFile(bucketName, fileName);
        return { message: 'File deleted successfully' };
    }

    // Generate a pre-signed URL for downloading a file
    @Get('presigned-url')
    async generatePresignedUrl(
        @Query('fileName') fileName: string,  // Name of the file to generate the link for
        @Query('directory') directory: string,  // Optional directory where the file is stored
        @Query('expiry') expiry: number  // Optional expiry time in seconds
    ) {
        const buckets = await this.minioService.minioClient.listBuckets();
        const bucketName = buckets[0].name;

        // Generate the full file path including directory if provided
        const filePath = directory ? `${directory}/${fileName}` : fileName;
        const presignedUrl = await this.publicationService.generatePresignedUrl(bucketName, filePath, expiry || 3600); // Default to 1 hour expiry

        return { url: presignedUrl };
    }

    // @Get('download/:fileName')
    // async downloadFile(@Param('fileName') fileName: string, @Res() res: Response) {
    //     const bucketName = 'mybucket';

    //     try {
    //         // Generate a presigned URL that expires in 1 hour
    //         const url = await this.minioService.generatePresignedUrl(bucketName, fileName, 3600);
    //         return res.redirect(url); // Redirect to the presigned URL
    //     } catch (err) {
    //         res.status(500).json({ error: 'Error generating download link' });
    //     }
    // }
    @Get('download/:fileName')
    async downloadFile(@Param('fileName') fileName: string, @Res() res: Response) {
        const bucketName = 'mybucket';

        try {
            // Generate a presigned URL that expires in 1 hour
            const url = await this.minioService.generatePublicUrl(bucketName, fileName);
            console.log(
                "url: " + url
            )
            return res.redirect(url); // Redirect to the presigned URL
        } catch (err) {
            res.status(500).json({ error: 'Error generating download link' });
        }
    }

}
