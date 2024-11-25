import type { DatabaseOptions } from 'st.db/src/types'
import { MongoDriver } from '@st.db/mongodb'
import { BaseDatabase } from 'easy-api.ts'
import { Database, Table } from 'st.db'

/**
 * The structure representing the structure of a database parameter method.
 */
export interface ArgsBody {
    /**
     * The name of the value.
     */
    name: string
    /**
     * The value itself.
     */
    value: string
    /**
     * The database table to set/get the value to/from.
     */
    table: string
}

/**
 * The constructor options for the database.
 */
export interface MongoDatabaseOptions extends DatabaseOptions {
    /**
     * The collection name in the database.
     */
    collectionName?: string
    /**
     * Mongo client connection options.
     */
    connectionOptions?: ConstructorParameters<typeof MongoDriver>[3]
    /**
     * The database name.
     */
    databaseName?: string
    /**
     * The tables to be used.
     * @default ['main']
     */
    tables?: string[]
    /**
     * The connection URI for the database.
     */
    uri: string
}

/**
 * The mongo implementation for easy-api.ts
 */
export class MongoDatabase extends BaseDatabase<Database, ArgsBody> {
    /**
     * The database itself.
     */
    public readonly driver: Database
    /**
     * The database table registry.
     */
    public readonly tables: Map<string, Table> = new Map()

    /**
     * Creates a new instance of the `MongoDatabase` class.
     * @param options - Constructor options for this database instance.
     * @returns {MongoDatabase}
     */
    public constructor(private options: MongoDatabaseOptions) {
        super()

        this.driver = new Database({
            ...options,
            driver: new MongoDriver(
                options.uri,
                options.databaseName,
                options.collectionName,
                options.connectionOptions
            )
        })

        if (!this.options.tables) this.options.tables = ['main'];
        else if (this.options.tables.length && !this.options.tables.includes('main')) this.options.tables.unshift('main');

        this.options.tables.forEach((name) => this.tables.set(name, new Table(name, this.driver)))
    }

    /**
     * Deletes a value from a database table.
     * @returns - The deleted key or none.
     */
    public async deleteValue<Return extends string | undefined | unknown = string>({ name, table = 'main' }: ArgsBody) {
        const fetchedTable = this.fetchTable(table)

        return await fetchedTable.delete(name) as Return
    }

    /**
     * Get a value from a database table.
     * @returns - The value to get.
     */
    public async getValue<Return>({ name, table = 'main' }: ArgsBody) {
        const fetchedTable = this.fetchTable(table)

        return await fetchedTable.get(name) as Return
    }

    /**
     * Check if some key exists in the given database table.
     * @returns {boolean}
     */
    public async hasValue<Return extends boolean | unknown = boolean>({ name, table = 'main' }: ArgsBody) {
        const fetchedTable = this.fetchTable(table)

        return await fetchedTable.has(name) as Return
    }

    /**
     * Set a value in a database table.
     */
    public async setValue<Return>({ name, value, table = 'main' }: ArgsBody) {
        const fetchedTable = this.fetchTable(table)

        return await fetchedTable.set(name, value) as Return
    }

    /**
     * Just for abstract class implementation, but not needed in this case.
     */
    public start() {}

    /**
     * Fetch a database table from the registry.
     * @param name - The name of the table to fetch.
     * @returns {Table}
     */
    private fetchTable(name: string) {
        const table = this.tables.get(name)
        if (!table) throw new Error(`Invalid database table name "${name}"!`);

        return table
    }
}