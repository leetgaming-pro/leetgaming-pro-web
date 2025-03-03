import { v4 as uuidv4 } from 'uuid';

export type ReplayFileStatus = 'Pending' | 'Processing' | 'Failed' | 'Completed';

export class ReplayFile {
  id: string;
  gameId: string;
  networkId: string;
  size: number;
  uri: string;
  status: ReplayFileStatus;
  resourceOwner: ResourceOwner;
  createdAt: Date;
  updatedAt: Date;

  constructor(
    gameId: string,
    networkId: string,
    size: number,
    uri: string,
    status: ReplayFileStatus,
    resourceOwner: ResourceOwner,
    createdAt: Date,
    updatedAt: Date
  ) {
    this.id = uuidv4();
    this.gameId = gameId;
    this.networkId = networkId;
    this.size = size;
    this.uri = uri;
    this.status = status;
    this.resourceOwner = resourceOwner;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }
}

export class ResourceOwner {
  id: string;
  name: string;

  constructor(id: string, name: string) {
    this.id = id;
    this.name = name;
  }
}

