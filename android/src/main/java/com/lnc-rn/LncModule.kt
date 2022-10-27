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

class LncModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

  override fun getName(): String {
    return "LncModule"
  }

  @ReactMethod
  fun registerLocalPrivCreateCallback(namespace: String, onLocalPrivCreate: Callback) {
     val lpccb = AndroidCallback()
     lpccb.setCallback(onLocalPrivCreate)

     Mobile.registerLocalPrivCreateCallback(namespace, lpccb)
  }

  @ReactMethod
  fun registerRemoteKeyReceiveCallback(namespace: String, onRemoteKeyReceive: Callback) {
     val rkrcb = AndroidCallback()
     rkrcb.setCallback(onRemoteKeyReceive)

     Mobile.registerRemoteKeyReceiveCallback(namespace, rkrcb)
  }

  @ReactMethod
  fun registerAuthDataCallback(namespace: String, onAuthData: Callback) {
     val oacb = AndroidCallback()
     oacb.setCallback(onAuthData)

     Mobile.registerAuthDataCallback(namespace, oacb)
  }

  @ReactMethod
  fun initLNC(namespace: String) {
     Mobile.initLNC(namespace, "info")
  }

  @ReactMethod
  fun isConnected(namespace: String, promise: Promise) {
     try {
        var response = Mobile.isConnected(namespace)
        promise.resolve(response);
     } catch(e: Throwable) {
        promise.reject("request Error", e);
     }
  }

  @ReactMethod
  fun status(namespace: String, promise: Promise) {
     try {
        var response = Mobile.status(namespace)
        promise.resolve(response);
     } catch(e: Throwable) {
        promise.reject("request Error", e);
     }
  }

  @ReactMethod
  fun expiry(namespace: String, promise: Promise) {
     try {
        var response = Mobile.getExpiry(namespace)
        promise.resolve(response);
     } catch(e: Throwable) {
        promise.reject("request Error", e);
     }
  }

  @ReactMethod
  fun isReadOnly(namespace: String, promise: Promise) {
     try {
        var response = Mobile.isReadOnly(namespace)
        promise.resolve(response);
     } catch(e: Throwable) {
        promise.reject("request Error", e);
     }
  }

  @ReactMethod
  fun hasPerms(namespace: String, permission: String, promise: Promise) {
     try {
        var response = Mobile.hasPermissions(namespace, permission)
        promise.resolve(response);
     } catch(e: Throwable) {
        promise.reject("request Error", e);
     }
  }

  @ReactMethod
  fun connectServer(namespace: String, mailboxServerAddr: String, isDevServer: Boolean = false, connectPhrase: String, localStatic: String, remoteStatic: String) {
     Log.d("connectMailbox", "called with connectPhrase: " + connectPhrase
     + " and mailboxServerAddr: " + mailboxServerAddr);

     Mobile.connectServer(namespace, mailboxServerAddr, isDevServer, connectPhrase, localStatic ?: "", remoteStatic ?: "")
  }

  @ReactMethod
  fun disconnect(namespace: String) {
     Mobile.disconnect(namespace)
  }

  @ReactMethod
  fun invokeRPC(namespace: String, route: String, requestData: String, rnCallback: Callback) {
     Log.d("request", "called with route: " + route
     + " and requestData: " + requestData);

     val gocb = AndroidCallback()
     gocb.setCallback(rnCallback)
     Mobile.invokeRPC(namespace, route, requestData, gocb)
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
  fun initListener(namespace: String, eventName: String, request: String) {
     val gocb = AndroidStreamingCallback()
     gocb.setEventName(eventName)
     gocb.setCallback(::sendEvent)
     Mobile.invokeRPC(namespace, eventName, request, gocb)
  }
}
