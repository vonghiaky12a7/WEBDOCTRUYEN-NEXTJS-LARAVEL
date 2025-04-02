<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use App\Http\Controllers\Controller;
use Laravel\Sanctum\PersonalAccessToken;
use App\Models\User;
use App\Mail\ResetPasswordMail;
use Illuminate\Support\Facades\Mail;


class AuthController extends Controller
{
    // Đăng ký người dùng
    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'username' => 'required|string|max:255|unique:users,username',
            'email' => 'required|string|email|max:255|unique:users,email',
            'password' => 'required|string|min:6',
        ]);

        if ($validator->fails()) {
            $errors = $validator->errors();

            // Trả về lỗi cho trường email hoặc username
            if ($errors->has('email')) {
                return response()->json(['message' => 'Email đã tồn tại trong hệ thống. Vui lòng sử dụng email khác.'], 422);
            }

            if ($errors->has('username')) {
                return response()->json(['message' => 'Tên người dùng đã được sử dụng. Vui lòng chọn tên khác.'], 422);
            }

            // Trường hợp lỗi khác
            return response()->json(['message' => 'Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.'], 422);
        }

        $user = User::create([
            'username' => $request->username,
            'email' => $request->email,
            'password' => Hash::make($request->password),
        ]);

        return response()->json([
            'message' => 'Đăng ký thành công!',
            'user' => $user,
        ], 201);
    }

    // Đăng nhập (chỉ token-based)
    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        // Kiểm tra email có tồn tại hay không
        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return response()->json([
                'field' => 'email',
                'message' => 'Email không tồn tại trong hệ thống',
            ], 404);
        }

        // Kiểm tra mật khẩu có đúng hay không
        if (!Auth::attempt($credentials)) {
            return response()->json([
                'field' => 'password',
                'message' => 'Mật khẩu không chính xác',
            ], 401);
        }

        // Nếu email và mật khẩu chính xác
        $user = Auth::user();

        // Xóa các token cũ
        $user->tokens()->delete();

        // Tạo token mới
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Đăng nhập thành công!',
            'user' => $user
        ])->cookie('auth_token', $token, 60); // cookie expires in 60 minutes
    }

    // Đăng xuất
    public function logout(Request $request)
    {
        try {
            // Revoke the current user's token
            $request->user()->currentAccessToken()->delete();

            return response()->json([
                'message' => 'Đăng xuất thành công',
            ], 200)->withoutCookie('auth_token');
        } catch (\Exception $e) {
            // Xử lý lỗi máy chủ trong quá trình đăng xuất
            return response()->json([
                'message' => 'Đã xảy ra lỗi khi đăng xuất. Vui lòng thử lại.',
                'error' => $e->getMessage() // Chỉ hiển thị lỗi này trong môi trường phát triển
            ], 500);
        }
    }

    // Lấy thông tin người dùng
    public function me(Request $request)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        return response()->json($user, 200); // Trả về trực tiếp object user
    }

    public function refreshToken(Request $request)
    {
        $user = $request->user();

        // Revoke current token
        $request->user()->currentAccessToken()->delete();

        // Create new token
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user' => $user
        ]);
    }


    public function verifyToken(Request $request)
    {
        // 🛑 Lấy token từ Header Authorization
        $token = $request->bearerToken();

        if (!$token) {
            return response()->json(['message' => 'Token không hợp lệ'], 401);
        }

        // 🔍 Tìm token trong cơ sở dữ liệu
        $accessToken = PersonalAccessToken::findToken($token);

        if (!$accessToken) {
            return response()->json(['message' => 'Token không hợp lệ'], 401);
        }

        // 🔑 Lấy user từ token
        $user = $accessToken->tokenable;

        if (!$user) {
            return response()->json(['message' => 'Người dùng không tồn tại'], 401);
        }

        return response()->json([
            'user' => $user
        ]);
    }

    public function sendResetLinkEmail(Request $request)
    {
        $request->validate(['email' => 'required|email|exists:users,email']);

        $status = Password::sendResetLink(
            $request->only('email'),
            function ($user, $token) {
                try {
                    $resetUrl = "http://localhost:3000/auth/reset-password?token={$token}&email=" . urlencode($user->email);
                    Mail::to($user->email)->send(new ResetPasswordMail($resetUrl));
                } catch (\Exception $e) {
                    // Ghi log lỗi để debug
                    \Log::error("Failed to send reset email: " . $e->getMessage());
                    throw $e; // Ném lỗi để Password::sendResetLink trả về trạng thái thất bại
                }
            }
        );

        return $status === Password::RESET_LINK_SENT
            ? response()->json(['message' => 'Email sent!'], 200)
            : response()->json(['message' => 'Unable to send email', 'error' => $status], 400);
    }


    public function resetPassword(Request $request)
    {

        $request->validate([
            'token' => 'required',
            'email' => 'required|email|exists:users,email',
            'password' => 'required|string|min:6|confirmed',
        ]);
        $status = Password::reset(
            $request->only('email', 'password', 'password_confirmation', 'token'),
            function ($user, $password) {
                $user->forceFill([
                    'password' => Hash::make($password),
                ])->save();
            }
        );

        \Log::info("Reset request - Email: {$request->email}, Token: {$request->token}");
        return $status === Password::PASSWORD_RESET
            ? response()->json(['status' => __($status)], 200)
            : response()->json(['error' => __($status)], 400);
    }
}
