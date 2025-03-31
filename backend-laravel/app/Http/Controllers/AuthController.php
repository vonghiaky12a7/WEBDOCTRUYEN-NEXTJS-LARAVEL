<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Cookie;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\DB;
use App\Http\Controllers\Controller;
use Laravel\Sanctum\PersonalAccessToken;
use App\Models\User;

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


    // Đăng nhập (hỗ trợ cả session-based và token-based)
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

        // Lưu role_id vào cookie nhưng không mã hóa
        $roleIdCookie = cookie('role_id', $user->roleId, 120, '/', 'localhost', false, false);

        return response()->json([
            'message' => 'Đăng nhập thành công!',
            'user' => $user
        ])->withCookie($roleIdCookie);
    }


    public function loginMobile(Request $request)
    {
        $credentials = $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        if (!Auth::attempt($credentials)) {
            return response()->json(['message' => 'Email hoặc mật khẩu không chính xác'], 401);
        }

        $user = Auth::user();

        // Xóa các token cũ
        $user->tokens()->delete();

        // Tạo token mới
        $token = $user->createToken('mobile_token')->plainTextToken;

        return response()->json([
            'message' => 'Đăng nhập thành công!',
            'token' => $token,
            'user' => $user
        ]);
    }

    // Đăng xuất
    public function logout(Request $request)
    {
        try {
            Cookie::expire('laravel_session');
            Cookie::expire('role_id');
            Cookie::expire('XSRF-TOKEN');

            return response()->json([
                'message' => 'Đăng xuất thành công',
            ], 200);
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
    public function refreshSession(Request $request)
    {
        try {
            // Lấy người dùng hiện tại
            $user = $request->user();

            if (!$user) {
                return response()->json([
                    'message' => 'Người dùng không xác định hoặc chưa đăng nhập.',
                ], 401);
            }

            // Làm mới session ID
            $request->session()->regenerate();
            $request->session()->regenerateToken();


            return response()->json([
                'message' => 'Session và CSRF token đã được làm mới thành công.'
            ], 200);
        } catch (\Exception $e) {
            // Xử lý lỗi máy chủ trong quá trình làm mới
            return response()->json([
                'message' => 'Đã xảy ra lỗi khi làm mới session và CSRF token.',
                'error' => $e->getMessage(), // Chỉ hiển thị lỗi chi tiết trong môi trường phát triển
            ], 500);
        }
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

    public function forgotPassword(Request $request)
    {
        $request->validate(['email' => 'required|email|exists:users,email']);

        $status = Password::sendResetLink($request->only('email'));

        return $status === Password::RESET_LINK_SENT
            ? response()->json(['message' => 'Email sent to !'], 200)
            : response()->json(['message' => 'Unable to send email'], 400);
    }

    public function verifyResetToken($email, $token)
    {
        $record = DB::table('password_reset_tokens')->where('email', $email)->first();

        if (!$record || !hash_equals($record->token, $token)) {
            return response()->json(['isValid' => false, 'message' => 'Token không hợp lệ hoặc đã hết hạn.'], 400);
        }

        return response()->json(['isValid' => true]);
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

        return $status === Password::PASSWORD_RESET
            ? response()->json(['status' => __($status)], 200)
            : response()->json(['error' => __($status)], 400);
    }
}