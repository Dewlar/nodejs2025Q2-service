import { ConsoleLogger, Injectable, LogLevel } from '@nestjs/common';
import fs from 'fs/promises';
import path from 'path';
// import * as process from "node:process";

@Injectable()
export class LoggerService extends ConsoleLogger {
  private level: LogLevel[] = [];
  private maxFileSize: number;
  private countersMap: Map<LogLevel, number> = new Map();

  constructor() {
    super();
    this.logLevelsInit();
    this.maxFileSize = +process.env.LOGGER_FILE_SIZE;

    process.on('unhandledRejection', (reason: unknown) =>
      this.error('unhandledRejection', reason),
    );
    process.on('uncaughtException', (error: Error) =>
      this.error('uncaughtException', error.stack),
    );
  }

  log(message: any) {
    if (!this.level.includes('log')) return;
    this.writeLogs('log', this.logMessage(message)).then();
  }

  error(message: any, stack?: any) {
    if (!this.level.includes('error')) return;
    this.writeLogs('error', this.logMessage(message, stack)).then();
  }

  warn(message: any) {
    if (!this.level.includes('warn')) return;
    this.writeLogs('warn', this.logMessage(message)).then();
  }

  debug(message: any) {
    if (!this.level.includes('debug')) return;
    this.writeLogs('debug', this.logMessage(message)).then();
  }

  verbose(message: any) {
    if (!this.level.includes('verbose')) return;
    this.writeLogs('verbose', this.logMessage(message)).then();
  }

  private logLevelsInit() {
    const logLevels = process.env.LOGGER_LEVELS.replace('[', '')
      .replace('[', '')
      .split(',');

    if (Array.isArray(logLevels)) {
      logLevels.forEach((level) => {
        if (['log', 'error', 'warn', 'debug', 'verbose'].includes(level)) {
          this.level.push(level as LogLevel);
          this.countersMap.set(level as LogLevel, 1);
        }
      });
    }
  }

  private logMessage(message: string, stack?: any) {
    let msg = `${new Date().toISOString()}: ${message}`;

    if (stack) {
      msg += `_${stack instanceof Error ? stack.stack : stack}`;
    }
    return msg;
  }

  private async writeLogs(logType: LogLevel, data: string) {
    data += '\n';
    const logFolderPath = path.resolve('/app/dist', 'logs');

    await fs.mkdir(logFolderPath, { recursive: true });

    let counter = this.countersMap.get(logType) ?? 0;
    let logFilePath = path.resolve(logFolderPath, `${logType}_${counter}.txt`);

    fs.access(logFilePath)
      .then(() => {
        fs.stat(logFilePath).then((stats) => {
          if (stats.size > this.maxFileSize) {
            counter += 1;
            this.countersMap.set(logType, counter);

            logFilePath = path.resolve(
              logFolderPath,
              `${logType}_${counter}.txt`,
            );
          }
        });
      })
      .catch((error) => console.log(error));

    await fs.writeFile(logFilePath, data, { flag: 'a' });
  }
}
