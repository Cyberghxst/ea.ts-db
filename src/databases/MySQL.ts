import type { DatabaseOptions } from 'st.db/src/types'
import { MySQLDriver } from '@st.db/mysql'
import { BaseDatabase } from 'easy-api.ts'
import type { ArgsBody } from './Mongo'
import { Database } from 'st.db'

/**
 * The constructor options for the database.
 */
export interface MySQLDatabaseOptions extends DatabaseOptions {
    /**
     * MySQL connection options.
     */
    connectionOptions: ConstructorParameters<typeof MySQLDriver>[0]
    /**
     * The table to be used.
     * @default 'main'
     */
    table?: string
}

/**
 * The MySQL implementation for easy-api.ts
 */
export class MySQLDatabase extends BaseDatabase<Database, ArgsBody> {
    /**
     * The database itself.
     */
    public readonly driver: Database

    /**
     * Creates a new instance of the `MongoDatabase` class.
     * @param options - Constructor options for this database instance.
     * @returns {MongoDatabase}
     */
    public constructor(private options: MySQLDatabaseOptions) {
        super()

        this.driver = new Database({
            ...options,
            driver: new MySQLDriver(
                options.connectionOptions,
                this.options.table
            )
        })

        if (!this.options.table) this.options.table = 'main';
    }

    /**
     * Deletes a value from a database table.
     * @returns - The deleted key or none.
     */
    public async deleteValue<Return extends string | undefined | unknown = string>({ name, table = 'main' }: ArgsBody) {
        return await this.driver.delete(name) as Return
    }

    /**
     * Get a value from a database table.
     * @returns - The value to get.
     */
    public async getValue<Return>({ name, table = 'main' }: ArgsBody) {
        return await this.driver.get(name) as Return
    }

    /**
     * Check if some key exists in the given database table.
     * @returns {boolean}
     */
    public async hasValue<Return extends boolean | unknown = boolean>({ name, table = 'main' }: ArgsBody) {
        return await this.driver.has(name) as Return
    }

    /**
     * Set a value in a database table.
     */
    public async setValue<Return>({ name, value, table = 'main' }: ArgsBody) {
        return await this.driver.set(name, value) as Return
    }

    /**
     * Just for abstract class implementation, but not needed in this case.
     */
    public start() {}
}