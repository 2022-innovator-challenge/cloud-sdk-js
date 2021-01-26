/**
 * Swagger Test Service
 * Test Service for OpenApi version 2 aka. Swagger as YAML file.
 *
 * The version of the OpenAPI document: 1.0.0
 *
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */
import { AxiosPromise, AxiosInstance } from 'axios';
import { Configuration } from '../configuration';
import { RequestArgs, BaseAPI } from '../base';
import { TestEntity } from '../model';
/**
 * DefaultApi - axios parameter creator
 * @export
 */
export declare const DefaultApiAxiosParamCreator: (configuration?: Configuration | undefined) => {
    /**
     *
     * @summary Test PATCH
     * @param {string} pathParam
     * @param {TestEntity} [testEntity]
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    patchEntity: (pathParam: string, testEntity?: TestEntity | undefined, options?: any) => Promise<RequestArgs>;
    /**
     * Test POST
     * @summary Test POST
     * @param {string} pathParam
     * @param {string} [queryParam]
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    postEntity: (pathParam: string, queryParam?: string | undefined, options?: any) => Promise<RequestArgs>;
};
/**
 * DefaultApi - functional programming interface
 * @export
 */
export declare const DefaultApiFp: (configuration?: Configuration | undefined) => {
    /**
     *
     * @summary Test PATCH
     * @param {string} pathParam
     * @param {TestEntity} [testEntity]
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    patchEntity(pathParam: string, testEntity?: TestEntity | undefined, options?: any): Promise<(axios?: AxiosInstance | undefined, basePath?: string | undefined) => AxiosPromise<void>>;
    /**
     * Test POST
     * @summary Test POST
     * @param {string} pathParam
     * @param {string} [queryParam]
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    postEntity(pathParam: string, queryParam?: string | undefined, options?: any): Promise<(axios?: AxiosInstance | undefined, basePath?: string | undefined) => AxiosPromise<Array<TestEntity>>>;
};
/**
 * DefaultApi - factory interface
 * @export
 */
export declare const DefaultApiFactory: (configuration?: Configuration | undefined, basePath?: string | undefined, axios?: AxiosInstance | undefined) => {
    /**
     *
     * @summary Test PATCH
     * @param {string} pathParam
     * @param {TestEntity} [testEntity]
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    patchEntity(pathParam: string, testEntity?: TestEntity | undefined, options?: any): AxiosPromise<void>;
    /**
     * Test POST
     * @summary Test POST
     * @param {string} pathParam
     * @param {string} [queryParam]
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    postEntity(pathParam: string, queryParam?: string | undefined, options?: any): AxiosPromise<Array<TestEntity>>;
};
/**
 * DefaultApi - object-oriented interface
 * @export
 * @class DefaultApi
 * @extends {BaseAPI}
 */
export declare class DefaultApi extends BaseAPI {
    /**
     *
     * @summary Test PATCH
     * @param {string} pathParam
     * @param {TestEntity} [testEntity]
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof DefaultApi
     */
    patchEntity(pathParam: string, testEntity?: TestEntity, options?: any): Promise<import("axios").AxiosResponse<void>>;
    /**
     * Test POST
     * @summary Test POST
     * @param {string} pathParam
     * @param {string} [queryParam]
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof DefaultApi
     */
    postEntity(pathParam: string, queryParam?: string, options?: any): Promise<import("axios").AxiosResponse<TestEntity[]>>;
}
//# sourceMappingURL=default-api.d.ts.map