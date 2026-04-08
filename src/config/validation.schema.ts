import * as Joi from 'joi';

export const envValidationSchema = Joi.object({
  APP_PORT: Joi.number().default(3000),
});
