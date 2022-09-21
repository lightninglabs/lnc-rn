package engineering.lightning.lnc.mobile.rn

import android.content.Context
import android.util.Log
import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule
import okhttp3.OkHttpClient
import java.io.IOException
import java.net.InetSocketAddress
import java.net.ServerSocket
import java.net.Proxy;
import java.security.cert.X509Certificate

import engineering.lightning.lnc.mobile.rn.AndroidCallback

import mobile.Mobile;
import mobile.NativeCallback;

class LncModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

  override fun getName(): String {
    return "LncModule"
  }

  @ReactMethod
  fun registerLocalPrivCreateCallback(onLocalPrivCreate: Callback) {
     val lpccb = AndroidCallback()
     lpccb.setCallback(onLocalPrivCreate)

     Mobile.registerLocalPrivCreateCallback(lpccb)
  }

  @ReactMethod
  fun registerRemoteKeyReceiveCallback(onRemoteKeyReceive: Callback) {
     val rkrcb = AndroidCallback()
     rkrcb.setCallback(onRemoteKeyReceive)

     Mobile.registerRemoteKeyReceiveCallback(rkrcb)
  }

  @ReactMethod
  fun registerAuthDataCallback(onAuthData: Callback) {
     val oacb = AndroidCallback()
     oacb.setCallback(onAuthData)

     Mobile.registerAuthDataCallback(oacb)
  }

  @ReactMethod
  fun initLNC() {
     Mobile.initLNC("info")
  }

  @ReactMethod
  fun isConnected(promise: Promise) {
     try {
        var response = Mobile.isConnected()
        promise.resolve(response);
     } catch(e: Throwable) {
        promise.reject("request Error", e);
     }
  }

  @ReactMethod
  fun status(promise: Promise) {
     try {
        var response = Mobile.status()
        promise.resolve(response);
     } catch(e: Throwable) {
        promise.reject("request Error", e);
     }
  }

  @ReactMethod
  fun expiry(promise: Promise) {
     try {
        var response = Mobile.getExpiry()
        promise.resolve(response);
     } catch(e: Throwable) {
        promise.reject("request Error", e);
     }
  }

  @ReactMethod
  fun isReadOnly(promise: Promise) {
     try {
        var response = Mobile.isReadOnly()
        promise.resolve(response);
     } catch(e: Throwable) {
        promise.reject("request Error", e);
     }
  }

  @ReactMethod
  fun hasPerms(permission: String, promise: Promise) {
     try {
        var response = Mobile.hasPermissions(permission)
        promise.resolve(response);
     } catch(e: Throwable) {
        promise.reject("request Error", e);
     }
  }

  @ReactMethod
  fun connectServer(mailboxServerAddr: String, isDevServer: Boolean = false, connectPhrase: String, localStatic: String, remoteStatic: String) {
     Log.d("connectMailbox", "called with connectPhrase: " + connectPhrase
     + " and mailboxServerAddr: " + mailboxServerAddr);

     Mobile.connectServer(mailboxServerAddr, isDevServer, connectPhrase, localStatic ?: "", remoteStatic ?: "")
  }

  @ReactMethod
  fun disconnect() {
     Mobile.disconnect()
  }

  @ReactMethod
  fun invokeRPC(route: String, requestData: String, rnCallback: Callback) {
     Log.d("request", "called with route: " + route
     + " and requestData: " + requestData);

     val gocb = AndroidCallback()
     gocb.setCallback(rnCallback)
     Mobile.invokeRPC(route, requestData, gocb)
  }

  private fun sendEvent(event: String, data: String) {
      val params = Arguments.createMap().apply {
        putString("result", data)
      }
      getReactApplicationContext()
        .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
        .emit(event, params)
  }

  @ReactMethod
  fun initListener(eventName: String, request: String) {
     val gocb = AndroidStreamingCallback()
     gocb.setEventName(eventName)
     gocb.setCallback(::sendEvent)
     Mobile.invokeRPC(eventName, request, gocb)
  }
}
