import {
  createLogger,
  encodeBase64,
  ErrorWithCause
} from '@sap-cloud-sdk/util';
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import CircuitBreaker from 'opossum';
import { urlAndAgent } from '../../../http-agent';
import { XsuaaServiceCredentials } from '../environment-accessor-types';
import {
  circuitBreakerDefaultOptions,
  ResilienceOptions
} from '../resilience-options';
import {
  ClientCredentials,
  ClientCredentialsResponse,
  UserTokenResponse
} from '../xsuaa-service-types';

const logger = createLogger({
  package: 'core',
  messageContext: 'xsuaa-service'
});

type XsuaaCircuitBreaker = CircuitBreaker<
  [requestConfig: AxiosRequestConfig],
  AxiosResponse
>;

let circuitBreaker: XsuaaCircuitBreaker;

/**
 * @deprecated Since v1.49.0 Use `@sap/xssec` lib instead.
 * Executes a client credentials grant request.
 * If the first parameter is an instance of [[XsuaaServiceCredentials]], the response's access_token will be verified.
 * If the first parameter is a URI, the response will not be verified.
 * @param tokenServiceUrlOrXsuaaServiceCredentials - The URL of the token service or the credentials of a XSUAA service instance.
 * @param clientCredentials - Client credentials for which to request a token.
 * @param options - Options to use by retrieving access token.
 * @param customBody - Object containing value required for the body request.
 * @returns A promise resolving to the response.
 */
export async function clientCredentialsGrant(
  tokenServiceUrlOrXsuaaServiceCredentials: string | XsuaaServiceCredentials,
  clientCredentials: ClientCredentials,
  options?: ResilienceOptions,
  customBody: Record<string, any> = {}
): Promise<ClientCredentialsResponse> {
  const authHeader = headerForClientCredentials(clientCredentials);
  const body = { grant_type: GrantType.CLIENT_CREDENTIALS, ...customBody };

  try {
    const { data } = await post(
      tokenServiceUrlOrXsuaaServiceCredentials,
      authHeader,
      objectToXWwwUrlEncodedBodyString(body),
      options
    );
    return data;
  } catch (error) {
    throw accessTokenError(error, GrantType.CLIENT_CREDENTIALS);
  }
}

/**
 * @deprecated Since v1.41.0 Use [[jwtBearerTokenGrant]] instead.
 * Executes a user token grant request against the given URI.
 * @param tokenServiceUrlOrXsuaaServiceCredentials - The URL of the token service or the credentials of a XSUAA service instance.
 * @param userJwt - The JWT of the user on whose behalf the request is executed.
 * @param clientId - The client_id of the target XSUAA service instance.
 * @param options - Options to use by retrieving access token
 * @returns A promise resolving to the response of the XSUAA service.
 */
export async function userTokenGrant(
  tokenServiceUrlOrXsuaaServiceCredentials: string | XsuaaServiceCredentials,
  userJwt: string,
  clientId: string,
  options?: ResilienceOptions
): Promise<UserTokenResponse> {
  const authHeader = 'Bearer ' + userJwt;
  const body = objectToXWwwUrlEncodedBodyString({
    client_id: clientId,
    grant_type: GrantType.USER_TOKEN,
    response_type: 'token'
  });

  try {
    const { data } = await post(
      tokenServiceUrlOrXsuaaServiceCredentials,
      authHeader,
      body,
      options
    );
    return data;
  } catch (error) {
    throw accessTokenError(error, GrantType.USER_TOKEN);
  }
}

/**
 * @deprecated Since v1.41.0 Use [[jwtBearerTokenGrant]] instead.
 * Executes a refresh token grant request against the given URI.
 * If the first parameter is an instance of [[XsuaaServiceCredentials]], the response's access_token will be verified.
 * If the first parameter is an URI, the response will not be verified.
 * @param tokenServiceUrlOrXsuaaServiceCredentials - The URL of the token service or the credentials of a XSUAA service instance.
 * @param clientCredentials - The credentials (client_id, client_secret) of the target XSUAA service instance.
 * @param refreshToken - The refresh token that should be used to generate a new access token.
 * @param options - Options to use by retrieving access token.
 * @returns A promise resolving to the response of the XSUAA service.
 */
export async function refreshTokenGrant(
  tokenServiceUrlOrXsuaaServiceCredentials: string | XsuaaServiceCredentials,
  clientCredentials: ClientCredentials,
  refreshToken: string,
  options?: ResilienceOptions
): Promise<UserTokenResponse> {
  const authHeader = headerForClientCredentials(clientCredentials);
  const body = objectToXWwwUrlEncodedBodyString({
    grant_type: GrantType.REFRESH_TOKEN,
    refresh_token: refreshToken
  });

  try {
    const { data } = await post(
      tokenServiceUrlOrXsuaaServiceCredentials,
      authHeader,
      body,
      options
    );
    return data;
  } catch (error) {
    throw accessTokenError(error, GrantType.REFRESH_TOKEN);
  }
}

/**
 * @deprecated Since v1.49.0 Use `@sap/xssec` lib instead.
 * Executes a JWT bearer token grant request against the given URI.
 * @param tokenServiceUrlOrXsuaaServiceCredentials - The URL of the token service or the credentials of a XSUAA service instance.
 * @param clientCredentials - The credentials (client_id, client_secret) of the target XSUAA service instance.
 * @param userJwt - The JWT of the user on whose behalf the request is executed.
 * @param options - Options to use by retrieving access token.
 * @returns A promise resolving to the response of the XSUAA service.
 */
export async function jwtBearerTokenGrant(
  tokenServiceUrlOrXsuaaServiceCredentials: string | XsuaaServiceCredentials,
  clientCredentials: ClientCredentials,
  userJwt: string,
  options?: ResilienceOptions
): Promise<ClientCredentialsResponse> {
  const authHeader = headerForClientCredentials(clientCredentials);
  const body = objectToXWwwUrlEncodedBodyString({
    client_id: clientCredentials.username,
    assertion: userJwt,
    grant_type: GrantType.JWT_BEARER_TOKEN,
    response_type: 'token'
  });

  try {
    const { data } = await post(
      tokenServiceUrlOrXsuaaServiceCredentials,
      authHeader,
      body,
      options
    );
    return data;
  } catch (error) {
    throw accessTokenError(error, GrantType.JWT_BEARER_TOKEN);
  }
}

function headers(authHeader: string): Pick<AxiosRequestConfig, 'headers'> {
  return {
    headers: {
      Authorization: authHeader,
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: 'application/json'
    }
  };
}

function post(
  tokenServiceUrlOrXsuaaServiceCredentials: string | XsuaaServiceCredentials,
  authHeader: string,
  body: string,
  options: ResilienceOptions = { enableCircuitBreaker: true }
): Promise<AxiosResponse> {
  const targetUri =
    typeof tokenServiceUrlOrXsuaaServiceCredentials === 'string'
      ? tokenServiceUrlOrXsuaaServiceCredentials
      : getTokenServiceUrl(tokenServiceUrlOrXsuaaServiceCredentials);

  const config: AxiosRequestConfig = {
    ...urlAndAgent(targetUri),
    proxy: false,
    method: 'post',
    data: body,
    ...headers(authHeader)
  };

  if (options.enableCircuitBreaker) {
    return getCircuitBreaker().fire(config);
  }
  return axios.request(config);
}

export function headerForClientCredentials(
  clientCredentials: ClientCredentials
): string {
  return (
    'Basic ' +
    encodeBase64(`${clientCredentials.username}:${clientCredentials.password}`)
  );
}
function objectToXWwwUrlEncodedBodyString(
  bodyAsObject: Record<string, any>
): string {
  return Object.entries(bodyAsObject)
    .map(kv => kv.join('='))
    .join('&');
}

enum GrantType {
  USER_TOKEN = 'user_token',
  REFRESH_TOKEN = 'refresh_token',
  CLIENT_CREDENTIALS = 'client_credentials',
  JWT_BEARER_TOKEN = 'urn:ietf:params:oauth:grant-type:jwt-bearer'
}

function getTokenServiceUrl(
  xsuaaServiceCredentials: XsuaaServiceCredentials
): string {
  const xsuaaUri = xsuaaServiceCredentials.url.replace(/\/$/, '');
  logger.info(
    `Adding "/oauth/token" to the end of the target uri: ${xsuaaUri}.`
  );
  return `${xsuaaUri}/oauth/token`;
}

function accessTokenError(error: Error, grant: string): Error {
  return new ErrorWithCause(
    `FetchTokenError: ${grantTypeMapper[grant]} Grant failed! ${error.message}`,
    error
  );
}

function getCircuitBreaker(): XsuaaCircuitBreaker {
  if (!circuitBreaker) {
    circuitBreaker = new CircuitBreaker(
      axios.request,
      circuitBreakerDefaultOptions
    );
  }
  return circuitBreaker;
}

const grantTypeMapper = {
  [GrantType.USER_TOKEN]: 'User token',
  [GrantType.REFRESH_TOKEN]: 'Refresh token',
  [GrantType.CLIENT_CREDENTIALS]: 'Client credentials',
  [GrantType.JWT_BEARER_TOKEN]: 'JWT token'
};