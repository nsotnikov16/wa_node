const db = require('../db/connection.js');
class Base {
    table = '';
    queryString = '';
    whereConditions = [];
    orWhereConditions = [];
    columns = ['*'];

    constructor() {
        this.db = db;
    }

    async query(query) {
        return new Promise((resolve, reject) => this.db.query(query, (err, data) => {
            if (err) return reject(err);
            resolve(data);
        }))
    }

    async queryWithQstring() {
        let result;
        try {
            result = await this.query(this.queryString);
            result.success = true;
        } catch (error) {
            result = {success: false, message: error.message ?? 'Ошибка'}
        }
        // console.log(result, this.queryString);
        this.reset();
        return result;
    }

    async create(fields) {
        let keys = Object.keys(fields).map(item => '`' + item + '`');
        let values = Object.values(fields).map(item => this.getValue(item));
        this.queryString = `INSERT INTO ${this.table} `;
        this.queryString += `(${keys.join(',')})`;
        this.queryString += ` VALUES (${values.join(',')})`;
        return this.queryWithQstring();
    }

    async get() {
        this.createSelectString();
        this.createWhereString();
        return this.queryWithQstring();
    }

    async delete() {
        this.queryString = `DELETE FROM ${this.table}`;
        this.createWhereString();
        return this.queryWithQstring();
    }

    async update(fields) {
        const str = Object.entries(fields).map(([column, value]) => `${this.getColumn(column)} = ${this.getValue(value)}`).join(',');
        this.queryString = `UPDATE ${this.table} SET ${str} `;
        this.createWhereString();
        return this.queryWithQstring();
    }

    select() {
        this.columns = Object.values(arguments);
        return this;
    }

    createSelectString() {
        this.queryString += `SELECT ${this.columns.join(',')} FROM ${this.table}`;
    }

    createWhereString() {
        if (!this.whereConditions.length && !this.orWhereConditions.length) return;
        this.queryString += ` WHERE `;
        if (this.whereConditions.length) this.queryString += this.whereConditions.map(item => `${this.getColumn(item.column)} ${item.condition} ${this.getValue(item.value)}`).join(' AND ');
        if (this.orWhereConditions.length) this.queryString += this.orWhereConditions.map(item => `${this.getColumn(item.column)} ${item.condition} ${this.getValue(item.value)}`).join(' OR ');
    }

    where(column, condition, value) {
        if (!value) {
            value = condition;
            condition = '=';
        }
        this.whereConditions.push({ column, condition, value })
        return this;
    }

    whereArray(array, logic = 'AND') {
        if (logic === 'AND') this.whereConditions = [...this.whereConditions, ...array];
        if (logic === 'ЩК') this.orWhereConditions = [...this.orWhereConditions, ...array];
        return this;
    }

    orWhere(column, condition, value) {
        if (!value) {
            value = condition;
            condition = '=';
        }

        this.orWhereConditions.push({ column, condition, value })
        return this;
    }

    getValue(value) {
        if (typeof value === 'string') return '"' + value + '"';
        if (typeof value === 'number') return value;
        if (typeof value === 'boolean') return Number(value);
        return '""';
    }

    getColumn = (column) => '`' + column + '`';

    reset() {
        this.whereConditions = [];
        this.orWhereConditions = [];
        this.columns = ['*'];
        this.queryString = '';
    }

    async find() {

    }
}

module.exports = Base;