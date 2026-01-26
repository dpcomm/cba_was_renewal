import { applyDecorators } from '@nestjs/common';
import { ApiResponse, getSchemaPath, ApiExtraModels } from '@nestjs/swagger';
import { ApiResponseBaseDto } from '../responses/api-response.dto';

export const ApiFailureResponse = (
  status: number,
  message: string = 'Error',
) => {
  return applyDecorators(
    ApiExtraModels(ApiResponseBaseDto),
    ApiResponse({
      status,
      description: message,
      schema: {
        allOf: [
          { $ref: getSchemaPath(ApiResponseBaseDto) },
          {
            properties: {
              success: { example: false },
              statusCode: { example: status },
              message: { example: message },
              error: { example: { code: 'ERROR_CODE', details: '...' } },
            },
          },
        ],
      },
    }),
  );
};
