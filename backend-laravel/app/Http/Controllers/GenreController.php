<?php

namespace App\Http\Controllers;

use App\Models\Genre;
use Illuminate\Http\Request;

class GenreController extends Controller
{
    /**
     * Lấy tất cả thể loại
     */
    public function index()
    {
        $genres = Genre::all();
        return response()->json($genres);
    }

    /**
     * Tạo thể loại mới
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|unique:genres,name',
        ]);

        $genre = Genre::create([
            'name' => $request->name,
        ]);

        return response()->json($genre, 201);
    }

    /**
     * Lấy chi tiết thể loại
     */
    public function show($genreId)
    {
        $genre = Genre::find($genreId);

        if (!$genre) {
            return response()->json(['message' => 'Genre not found'], 404);
        }

        return response()->json($genre);
    }

    /**
     * Cập nhật thể loại
     */
    public function update(Request $request, $genreId)
    {
        $genre = Genre::find($genreId);

        if (!$genre) {
            return response()->json(['message' => 'Genre not found'], 404);
        }

        $request->validate([
            'name' => 'required|string|unique:genres,name,' . $genreId,
        ]);

        $genre->name = $request->name;
        $genre->save();

        return response()->json($genre);
    }

    /**
     * Xóa thể loại
     */
    public function destroy($genreId)
    {
        $genre = Genre::find($genreId);

        if (!$genre) {
            return response()->json(['message' => 'Genre not found'], 404);
        }

        $genre->delete();

        return response()->json(['message' => 'Genre deleted successfully']);
    }
}
