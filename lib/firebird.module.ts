import { Module } from '@nestjs/common';
import { FirebirdService } from './firebird.service';

@Module({
  providers: [FirebirdService]
})
export class FirebirdModule {}
