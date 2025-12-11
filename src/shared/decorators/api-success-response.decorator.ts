import { applyDecorators, Type } from '@nestjs/common';
import { ApiOkResponse, getSchemaPath, ApiExtraModels } from '@nestjs/swagger';
import { ApiResponseDto, ApiResponseBaseDto } from '../responses/api-response.dto';

interface ApiSuccessResponseOptions<TModel extends Type<any>> {
  type?: TModel;
  isArray?: boolean;
  status?: number;
  description?: string;
}

export const ApiSuccessResponse = <TModel extends Type<any>>(
  options: ApiSuccessResponseOptions<TModel>,
) => {
  const { type, isArray, status, description } = options;

  if (!type) {
    return applyDecorators(
        ApiOkResponse({
            description: description || 'Success',
            schema: {
                allOf: [
                    { $ref: getSchemaPath(ApiResponseBaseDto) },
                ]
            }
        })
    )
  }

  return applyDecorators(
    ApiExtraModels(ApiResponseBaseDto, type),
    ApiOkResponse({
      description: description || 'Success',
      schema: {
        allOf: [
          { $ref: getSchemaPath(ApiResponseBaseDto) },
          {
            properties: {
              data: isArray
                ? {
                    type: 'array',
                    items: { $ref: getSchemaPath(type) },
                  }
                : {
                    $ref: getSchemaPath(type),
                  },
            },
          },
        ],
      },
    }),
  );
};
