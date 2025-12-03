/**
 * User Model
 * Represents a user in the system
 */

import { Model } from 'guruorm';

export class User extends Model {
  static table = 'users';
  
  static fillable = ['name', 'email', 'password'];
  
  static hidden = ['password'];
  
  /**
   * Find user by email
   */
  static async findByEmail(email) {
    return await this.query().where('email', email).first();
  }
}
