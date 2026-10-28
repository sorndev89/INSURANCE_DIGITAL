import 'package:dio/dio.dart';

import '../config/app_config.dart';

class ApiException implements Exception {
  ApiException(this.message, {this.statusCode});

  final String message;
  final int? statusCode;

  @override
  String toString() => message;
}

class ApiClient {
  ApiClient({String? token}) : _token = token {
    _dio = Dio(
      BaseOptions(
        baseUrl: AppConfig.apiBaseUrl,
        connectTimeout: const Duration(seconds: 20),
        receiveTimeout: const Duration(seconds: 30),
        headers: {
          'Accept': 'application/json',
          'X-Tenant': AppConfig.tenantSlug,
        },
      ),
    );
    _dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) {
          if (_token != null && _token!.isNotEmpty) {
            options.headers['Authorization'] = 'Bearer $_token';
          }
          handler.next(options);
        },
        onError: (error, handler) {
          handler.next(error);
        },
      ),
    );
  }

  late final Dio _dio;
  String? _token;

  set token(String? value) => _token = value;

  Future<dynamic> get(String path, {Map<String, dynamic>? query}) async {
    try {
      final response = await _dio.get<dynamic>(path, queryParameters: query);
      return response.data;
    } on DioException catch (error) {
      throw _mapError(error);
    }
  }

  Future<dynamic> post(String path, {Object? data}) async {
    try {
      final response = await _dio.post<dynamic>(path, data: data);
      return response.data;
    } on DioException catch (error) {
      throw _mapError(error);
    }
  }

  Future<dynamic> patch(String path, {Object? data}) async {
    try {
      final response = await _dio.patch<dynamic>(path, data: data);
      return response.data;
    } on DioException catch (error) {
      throw _mapError(error);
    }
  }

  Future<dynamic> upload(
    String path, {
    required String filePath,
    required String fileName,
  }) async {
    try {
      final form = FormData.fromMap({
        'file': await MultipartFile.fromFile(filePath, filename: fileName),
      });
      final response = await _dio.post<dynamic>(path, data: form);
      return response.data;
    } on DioException catch (error) {
      throw _mapError(error);
    }
  }

  ApiException _mapError(DioException error) {
    final data = error.response?.data;
    if (data is Map && data['error'] is Map) {
      final message = data['error']['message'];
      return ApiException(
        message is String ? message : 'ເຊື່ອມຕໍ່ລະບົບບໍ່ສຳເລັດ',
        statusCode: error.response?.statusCode,
      );
    }
    if (error.type == DioExceptionType.connectionTimeout ||
        error.type == DioExceptionType.receiveTimeout ||
        error.type == DioExceptionType.connectionError) {
      return ApiException('ບໍ່ສາມາດເຊື່ອມຕໍ່ເຊີບເວີໄດ້');
    }
    return ApiException(
      error.message ?? 'ເກີດຂໍ້ຜິດພາດ',
      statusCode: error.response?.statusCode,
    );
  }
}
