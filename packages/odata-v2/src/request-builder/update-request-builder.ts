import { createLogger, isNullish } from '@sap-cloud-sdk/util';
import {
  Destination,
  DestinationFetchOptions
} from '@sap-cloud-sdk/connectivity';
import { HttpResponse } from '@sap-cloud-sdk/http-client';
import {
  Constructable,
  EntityIdentifiable,
  ODataRequest,
  ODataUpdateRequestConfig,
  UpdateRequestBuilderBase,
  isNavigationProperty,
  removePropertyOnCondition
} from '@sap-cloud-sdk/odata-common';
import { Entity } from '../entity';
import { entitySerializer } from '../entity-serializer';
import { oDataUri } from '../uri-conversion/odata-uri';
import { extractODataEtag } from '../extract-odata-etag';

const logger = createLogger({
  package: 'core',
  messageContext: 'update-request-builder-v2'
});
/**
 * Create OData query to update an entity.
 * @typeparam EntityT - Type of the entity to be updated
 */
export class UpdateRequestBuilder<EntityT extends Entity>
  extends UpdateRequestBuilderBase<EntityT>
  implements EntityIdentifiable<EntityT>
{
  /**
   * Creates an instance of UpdateRequestBuilder.
   * @param _entityConstructor - Constructor type of the entity to be updated
   * @param _entity - Entity to be updated
   */
  constructor(
    readonly _entityConstructor: Constructable<EntityT>,
    readonly _entity: EntityT
  ) {
    super(
      _entityConstructor,
      _entity,
      oDataUri,
      entitySerializer,
      extractODataEtag,
      removeNavPropsAndComplexTypes
    );
  }

  /**
   * Executes the query.
   * @param destination - Destination or DestinationFetchOptions to execute the request against
   * @param options - Options to employ when fetching destinations
   * @returns A promise resolving to the entity once it was updated
   */
  async execute(
    destination: Destination | DestinationFetchOptions
  ): Promise<EntityT> {
    if (this.isEmptyObject(this.requestConfig.payload)) {
      return this._entity;
    }

    const request = await this.build(destination);
    warnIfNavigation(request, this._entity, this._entityConstructor);

    return super.executeRequest(request);
  }

  /**
   * Execute request and return an [[HttpResponse]]. The request is only executed if some properties of the entity are modified.
   * @param destination - Destination or DestinationFetchOptions to execute the request against
   * @param options - Options to employ when fetching destinations
   * @returns A promise resolving to an [[HttpResponse]] when the request is executed or `undefined` otherwise.
   */
  async executeRaw(
    destination: Destination | DestinationFetchOptions
  ): Promise<HttpResponse | undefined> {
    if (this.isEmptyObject(this.requestConfig.payload)) {
      logger.info(
        'The request is not executed because no properties of the entity are modified.'
      );
      return;
    }

    const request = await this.build(destination);
    warnIfNavigation(request, this._entity, this._entityConstructor);

    return super.executeRequestRaw(request);
  }
}

/*
 * In case the entity contains a navigation to a different entity a warning is printed.
 */
function warnIfNavigation<EntityT extends Entity>(
  request: ODataRequest<ODataUpdateRequestConfig<EntityT>>,
  entity: EntityT,
  entityConstructor: Constructable<EntityT>
): ODataRequest<ODataUpdateRequestConfig<EntityT>> {
  const setNavigationProperties = Object.keys(entity).filter(
    key =>
      !isNullish(entity[key]) && isNavigationProperty(key, entityConstructor)
  );

  if (setNavigationProperties.length) {
    logger.warn(
      `The navigation properties ${setNavigationProperties} have been included in your update request. Update of navigation properties is not supported and will be ignored.`
    );
  }

  return request;
}

function removeNavPropsAndComplexTypes(
  body: Record<string, any>
): Record<string, any> {
  return removePropertyOnCondition(([, val]) => typeof val === 'object', body);
}