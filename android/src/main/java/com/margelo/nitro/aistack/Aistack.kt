package com.margelo.nitro.aistack

import com.facebook.proguard.annotations.DoNotStrip

@DoNotStrip
class Aistack : HybridAistackSpec() {
  override fun multiply(a: Double, b: Double): Double {
    return a * b
  }
}
