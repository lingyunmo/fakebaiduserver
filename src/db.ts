import { open } from 'sqlite';
import sqlite3 from 'sqlite3';
import path from 'path';

export const dbPromise = open({
    filename: path.join(__dirname, '../data', 'database'),
    driver: sqlite3.Database
});