import { applyDecorators } from '@nestjs/common';
import { ApiResponse, getSchemaPath, ApiExtraModels } from '@nestjs/swagger';
import { ApiResponseBaseDto } from '../responses/api-response.dto';

export const ApiFailureResponse = (
  status: number,
  message: string | readonly string[] = 'Error',
) => {
  const messages = Array.isArray(message) ? message : [message];

  return applyDecorators(
    ApiExtraModels(ApiResponseBaseDto),
    ApiResponse({
      status,
      description: messages.join(' / '),
      schema: {
        allOf: [
          { $ref: getSchemaPath(ApiResponseBaseDto) },
          {
            properties: {
              success: { example: false },
              statusCode: { example: status },
              message:
                messages.length === 1
                  ? { example: messages[0] }
                  : {
                      oneOf: messages.map((errorMessage) => ({
                        type: 'string',
                        example: errorMessage,
                      })),
                    },
              error: { example: { code: 'ERROR_CODE', details: '...' } },
            },
          },
        ],
      },
    }),
  );
};
