import { Module, DynamicModule, OnModuleInit } from '@nestjs/common';
import { FirebirdService } from './firebird.service';
import { FirebirdModuleOptions } from './interfaces';
import { FIREBIRD_MODULE_OPTIONS } from './firebird.constants';

@Module({
  providers: [FirebirdService],
  exports: [FirebirdService]
})
export class FirebirdModule implements OnModuleInit {
  public constructor(private readonly firebirdService: FirebirdService) {}

  public static forRoot(options: FirebirdModuleOptions = {}): DynamicModule {
    const firebirdModuleOptions = {
      provide: FIREBIRD_MODULE_OPTIONS,
      useValue: options
    };
    return {
      module: FirebirdModule,
      providers: [firebirdModuleOptions]
    };
  }

  public onModuleInit(): void {
    this.firebirdService.TestConnection();
  }
}
