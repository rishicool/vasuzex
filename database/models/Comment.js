import Model from 'vasuzex/Database/Model.js';
import { Relations } from 'vasuzex/Database/Relations.js';
import { Post } from './Post.js';

export class Comment extends Model {
  static tableName = 'comments';
  static primaryKey = 'id';
  static timestamps = true;
  static fillable = ['post_id', 'author', 'content'];
  static casts = {
    post_id: 'int'
  };

  /**
   * Get post for this comment
   */
  post() {
    return Relations.belongsTo(this, Post, 'post_id', 'id');
  }
}
