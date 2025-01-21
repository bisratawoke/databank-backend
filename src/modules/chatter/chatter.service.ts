import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import Chatter from './schemas/chatter.schema';
import { CreateChatterDto, UpdateChatterDto } from './dto/chatter.dto';
import Message from './schemas/message.schema';
import mongoose from 'mongoose';
import { User } from '../auth/schemas/user.schema';

@Injectable()
export class ChatterService {
  constructor(
    @InjectModel(Chatter.name) private readonly chatterModel: Model<Chatter>,
    @InjectModel(Message.name) private readonly messageModel: Model<Message>,
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}

  async getChatBySubjectId(id: string): Promise<any> {
    // Step 1: Attempt to fetch the Chatter document using the subject ID
    let chatter = await this.chatterModel.findOne({ subject: id }).exec();

    // Step 2: If Chatter does not exist, create it
    if (!chatter) {
      console.log(
        `Chatter with subject ID ${id} not found. Creating a new Chatter.`,
      );
      const createdChatter = new this.chatterModel({
        subject: id,
        messages: [],
      });
      chatter = await createdChatter.save();
    }

    // Step 3: Fetch messages using the IDs in the chatter's messages array
    const messages = await this.messageModel
      .find({ _id: { $in: chatter.messages } })
      .exec();

    // Step 4: Manually join messages with user data
    const messagesWithUsers = await Promise.all(
      messages.map(async (message) => {
        const user = await this.userModel.findById(message.from).exec();
        return {
          ...message.toObject(),
          user, // Add user data to each message
        };
      }),
    );

    console.log('========= in message model ==================');
    console.log(messagesWithUsers);
    // Step 5: Combine and return the results
    return {
      ...chatter.toObject(),
      messages: messagesWithUsers, // Replace message IDs with full message documents (including user data)
    };
  }

  async findAll(query: any): Promise<any[]> {
    // Step 1: Fetch all Chatter documents
    const chatters = await this.chatterModel.find(query).exec();

    // Step 2: Fetch messages for each Chatter
    const results = await Promise.all(
      chatters.map(async (chatter) => {
        const messages = await this.messageModel
          .find({ _id: { $in: chatter.messages } })
          .exec();
        return {
          ...chatter.toObject(),
          messages, // Replace message IDs with full message documents
        };
      }),
    );

    return results;
  }

  async findOne(id: string): Promise<any> {
    // Step 1: Fetch the Chatter document
    const chatter = await this.chatterModel.findById(id).exec();

    if (!chatter) {
      throw new Error(`Chatter with ID ${id} not found`);
    }

    // Step 2: Fetch messages using the IDs in the chatter's messages array
    const messages = await this.messageModel
      .find({ _id: { $in: chatter.messages } })
      .exec();

    // Step 3: Combine and return the results
    return {
      ...chatter.toObject(),
      messages, // Replace message IDs with full message documents
    };
  }

  async createMessage({
    message,
    userId,
    chatterId,
  }: {
    message: string;
    userId: string;
    chatterId: string;
  }): Promise<any> {
    console.log({
      message,
      userId,
      chatterId,
    });

    // Create the message
    const obj = {
      message, // Matches the 'message' field in the schema
      from: userId, // Matches the 'from' field in the schema
    };

    const createdMessage = new this.messageModel(obj);
    const savedMessage = await createdMessage.save();

    console.log('Saved Message:', savedMessage);

    // Validate Chatter ID

    if (!mongoose.Types.ObjectId.isValid(chatterId)) {
      throw new Error('Invalid Chatter ID');
    }

    // Update the Chatter document with the new message
    const updatedChatter = await this.chatterModel
      .findByIdAndUpdate(
        chatterId,
        { $push: { messages: savedMessage._id } },
        { new: true }, // Return the updated document
      )
      .populate('messages');

    console.log('Updated Chatter:', updatedChatter);

    const res = await this.findOne(updatedChatter._id.toString());
    return res;
  }

  async create(createChatterDto: CreateChatterDto): Promise<Chatter> {
    const createdChatter = new this.chatterModel(createChatterDto);
    return createdChatter.save();
  }

  async update(
    id: string,
    updateChatterDto: UpdateChatterDto,
  ): Promise<Chatter> {
    return this.chatterModel
      .findByIdAndUpdate(id, updateChatterDto, { new: true })
      .exec();
  }

  async delete(id: string): Promise<any> {
    return;
    // return this.chatterModel.findByIdAndRemove(id).exec();
  }
}
