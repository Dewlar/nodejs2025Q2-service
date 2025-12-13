import { ConsoleLogger, Injectable, LogLevel } from '@nestjs/common';
import * as fs from 'fs/promises';
import * as path from 'path';
import { Stats } from 'fs';

@Injectable()
export class LoggerService extends ConsoleLogger {
  private logLevels: LogLevel[] = [];
  private maxFileSize: number;
  private countersMap: Map<LogLevel, number> = new Map();

  constructor() {
    super('loggerService');
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
    if (!this.logLevels.includes('log')) return;
    this.writeLogs('log', this.logMessage(message)).then();
  }

  error(message: any, stack?: any) {
    if (!this.logLevels.includes('error')) return;
    this.writeLogs('error', this.logMessage(message, stack)).then();
  }

  warn(message: any) {
    if (!this.logLevels.includes('warn')) return;
    this.writeLogs('warn', this.logMessage(message)).then();
  }

  debug(message: any) {
    if (!this.logLevels.includes('debug')) return;
    this.writeLogs('debug', this.logMessage(message)).then();
  }

  verbose(message: any) {
    if (!this.logLevels.includes('verbose')) return;
    this.writeLogs('verbose', this.logMessage(message)).then();
  }

  private logLevelsInit() {
    const logLevelStr = process.env.LOGGER_LEVELS.replace(/^\[|\]$/g, '');
    const logLevels: string[] = logLevelStr.split(',').map((l) => l.trim());

    if (Array.isArray(logLevels)) {
      logLevels.forEach((level) => {
        if (['log', 'error', 'warn', 'debug', 'verbose'].includes(level)) {
          this.logLevels.push(level as LogLevel);
          this.countersMap.set(level as LogLevel, 1);
        }
      });
    }
  }

  private logMessage(message: string, stack?: any) {
    super.log(message);

    let msg = `${new Date().toISOString()}: ${message}`;

    if (stack) {
      msg += `_${stack instanceof Error ? stack.stack : stack}`;
    }
    return msg;
  }

  private async writeLogs(logType: LogLevel, data: string) {
    const logFolderPath = path.resolve(process.cwd(), 'dist', 'logs');
    await fs.mkdir(logFolderPath, { recursive: true });

    try {
      let counter = this.countersMap.get(logType) ?? 1;
      let logFilePath = path.join(logFolderPath, `${logType}_${counter}.txt`);

      // const existFileStats = await fs
      //   .stat(logFolderPath)
      //   .then((stat) => stat)
      //   .catch((err) => (err.code === 'ENOENT' ? null : Promise.reject(err)));

      let existFileStats: Stats | null = null;
      try {
        existFileStats = await fs.stat(logFilePath);
      } catch (err) {
        if (err.code !== 'ENOENT') throw err;
      }

      if (existFileStats && existFileStats.size > this.maxFileSize) {
        counter += 1;
        this.countersMap.set(logType, counter);
        logFilePath = path.join(logFolderPath, `${logType}_${counter}.txt`);
      }

      await fs.writeFile(logFilePath, data + '\n', { flag: 'a' });
    } catch (error) {
      console.error('Error in writeLogs:', error);
    }
  }
}
