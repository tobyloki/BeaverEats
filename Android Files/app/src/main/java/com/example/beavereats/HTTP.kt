package com.example.beavereats

import com.jakewharton.retrofit2.adapter.kotlin.coroutines.CoroutineCallAdapterFactory
import com.squareup.moshi.Moshi
import com.squareup.moshi.kotlin.reflect.KotlinJsonAdapterFactory
import kotlinx.coroutines.Deferred
import okhttp3.MediaType
import okhttp3.RequestBody
import okhttp3.ResponseBody
import org.json.JSONArray
import org.json.JSONObject
import retrofit2.Call
import retrofit2.Response
import retrofit2.Retrofit
import retrofit2.converter.moshi.MoshiConverterFactory
import retrofit2.converter.scalars.ScalarsConverterFactory
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.Headers
import retrofit2.http.POST

private const val BASE_URL = "https://beaver-eats-backend-demo.fly.dev"

// TODO (04) Use the Moshi Builder to create a Moshi object with the KotlinJsonAdapterFactory
private val moshi = Moshi.Builder()
    .add(KotlinJsonAdapterFactory())
    .build()

// TODO (02) Use Retrofit Builder with Scalars ConverterFactory and BASE_URL
private val retrofit = Retrofit.Builder()
    .addConverterFactory(ScalarsConverterFactory.create())
    .addConverterFactory(MoshiConverterFactory.create(moshi))
    .addCallAdapterFactory(CoroutineCallAdapterFactory())
    .baseUrl(BASE_URL)
    .build()
// TODO (03) Implement the MarsApiService interface with @GET getProperties returning a String
interface HttpService {
    @GET("/locations")
    fun getRestaurantsAsync(): Deferred<String>
    @POST("/restaurant")
    @Headers("Content-Type: application/json")
    fun createRestaurantAsync(@Body restaurant: RequestBody): Deferred<Response<Unit>>  // 204 response type should be Response<Unit> - https://stackoverflow.com/a/59636492/16762230
}
// TODO (04) Create the MarsApi object using Retrofit to implement the MarsApiService
object HttpApi {
    val retrofitService: HttpService by lazy {
        retrofit.create(HttpService::class.java)
    }
}